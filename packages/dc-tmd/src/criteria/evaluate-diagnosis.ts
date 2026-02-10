/**
 * Diagnosis Evaluation Orchestration
 *
 * Evaluates a complete DiagnosisDefinition across all side × region locations.
 * The anamnesis criterion is evaluated once (globally), while examination
 * criteria are evaluated for each side × region combination.
 */

import { SIDE_KEYS } from "../ids/anatomy";
import type { DiagnosisDefinition, DiagnosisEvaluationResult, CriteriaLocationResult } from "./location";
import { evaluate } from "./evaluate";
import type { CriterionResult, CriterionStatus } from "./types";

/**
 * Evaluate a complete diagnosis definition against patient data.
 *
 * 1. Evaluates anamnesis criterion globally (no template context)
 * 2. Evaluates examination criterion for each side × region
 * 3. Returns combined result with full traceability
 */
export function evaluateDiagnosis(
  diagnosis: DiagnosisDefinition,
  data: unknown
): DiagnosisEvaluationResult {
  // 1. Evaluate anamnesis globally
  const anamnesisResult = evaluate(diagnosis.anamnesis, data);
  const anamnesisMet = anamnesisResult.status === "positive";
  const anamnesisStatus = anamnesisResult.status;

  // 2. Evaluate examination per location (side × region)
  const locationResults: CriteriaLocationResult[] = [];

  for (const side of SIDE_KEYS) {
    for (const region of diagnosis.examination.regions) {
      // Evaluate sided anamnesis if defined (per-location with ${side} context)
      const sidedAnamnesisResult = diagnosis.sidedAnamnesis
        ? evaluate(diagnosis.sidedAnamnesis, data, { side, region })
        : null;

      const examinationResult = evaluate(diagnosis.examination.criterion, data, {
        side,
        region,
      });

      // Location is positive only if sided anamnesis (when present) AND examination are both positive
      const sidedAnamnesisMet = !sidedAnamnesisResult || sidedAnamnesisResult.status === "positive";
      const examinationMet = examinationResult.status === "positive";
      const isPositive = sidedAnamnesisMet && examinationMet;

      // Derive location status considering both sided anamnesis and examination
      const status = deriveLocationStatus(sidedAnamnesisResult, examinationResult);

      locationResults.push({
        side,
        region,
        isPositive,
        status,
        ...(sidedAnamnesisResult ? { sidedAnamnesisResult } : {}),
        examinationResult,
      });
    }
  }

  // 3. Derive overall result
  const hasPositiveLocation = locationResults.some((loc) => loc.isPositive);
  const isPositive = anamnesisMet && hasPositiveLocation;

  // Status: negative if any definitive negative, pending if any pending, else positive
  const status = deriveOverallStatus(anamnesisStatus, locationResults);

  const positiveLocations = locationResults
    .filter((loc) => loc.isPositive)
    .map(({ side, region }) => ({ side, region }));

  return {
    diagnosisId: diagnosis.id,
    isPositive,
    status,
    anamnesisMet,
    anamnesisStatus,
    anamnesisResult,
    locationResults,
    positiveLocations,
  };
}

/**
 * Derive location status from sided anamnesis and examination results.
 *
 * When sided anamnesis is present, both must agree for the location to be positive.
 * Either being negative makes the location negative; pending propagates.
 */
function deriveLocationStatus(
  sidedAnamnesisResult: CriterionResult | null,
  examinationResult: CriterionResult
): CriterionStatus {
  if (!sidedAnamnesisResult) return examinationResult.status;

  const sa = sidedAnamnesisResult.status;
  const ex = examinationResult.status;

  // Either negative → location negative
  if (sa === "negative" || ex === "negative") return "negative";
  // Both positive → location positive
  if (sa === "positive" && ex === "positive") return "positive";
  // Otherwise pending
  return "pending";
}

/**
 * Derive overall status from anamnesis and location results.
 *
 * - If anamnesis is negative → negative (can't be positive regardless of locations)
 * - If anamnesis is positive and at least one location positive → positive
 * - If anamnesis is positive and all locations negative → negative
 * - If anything is pending and nothing contradicts → pending
 */
function deriveOverallStatus(
  anamnesisStatus: CriterionStatus,
  locationResults: CriteriaLocationResult[]
): CriterionStatus {
  // Anamnesis negative → overall negative
  if (anamnesisStatus === "negative") return "negative";

  const hasPositiveLocation = locationResults.some((loc) => loc.status === "positive");
  const hasPendingLocation = locationResults.some((loc) => loc.status === "pending");
  const allLocationsNegative = locationResults.every((loc) => loc.status === "negative");

  // Anamnesis positive
  if (anamnesisStatus === "positive") {
    if (hasPositiveLocation) return "positive";
    if (allLocationsNegative) return "negative";
    // Some pending locations remain
    return "pending";
  }

  // Anamnesis pending
  if (allLocationsNegative) return "negative";
  if (hasPendingLocation || hasPositiveLocation) return "pending";
  return "pending";
}

/**
 * Evaluate all defined diagnoses against patient data.
 *
 * After individual evaluation, enforces cross-diagnosis `requires` constraints:
 * if a diagnosis requires another positive diagnosis (e.g. headache requires
 * myalgia or arthralgia) and none are positive, it is overridden to negative.
 */
export function evaluateAllDiagnoses(
  diagnoses: readonly DiagnosisDefinition[],
  data: unknown
): DiagnosisEvaluationResult[] {
  const results = diagnoses.map((diagnosis) => evaluateDiagnosis(diagnosis, data));

  // Enforce cross-diagnosis requires constraints
  const positiveIds = new Set(results.filter((r) => r.isPositive).map((r) => r.diagnosisId));

  for (let i = 0; i < diagnoses.length; i++) {
    const def = diagnoses[i];
    const result = results[i];
    if (!def.requires || !result.isPositive) continue;

    const requirementMet = def.requires.anyOf.some((id) => positiveIds.has(id));
    if (!requirementMet) {
      results[i] = {
        ...result,
        isPositive: false,
        status: "negative",
      };
    }
  }

  return results;
}
