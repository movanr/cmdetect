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
import type { CriterionStatus } from "./types";

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
      const examinationResult = evaluate(diagnosis.examination.criterion, data, {
        side,
        region,
      });

      locationResults.push({
        side,
        region,
        isPositive: examinationResult.status === "positive",
        status: examinationResult.status,
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
 * Imports ALL_DIAGNOSES lazily to avoid circular dependency.
 */
export function evaluateAllDiagnoses(
  diagnoses: readonly DiagnosisDefinition[],
  data: unknown
): DiagnosisEvaluationResult[] {
  return diagnoses.map((diagnosis) => evaluateDiagnosis(diagnosis, data));
}
