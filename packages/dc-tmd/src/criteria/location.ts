/**
 * Location Types for DC/TMD Criteria Evaluation
 *
 * Defines types for per-location examination criteria evaluation.
 * Examination criteria are evaluated for each side × region combination.
 */

import type { Side, Region } from "../ids/anatomy";
import type { DiagnosisId } from "../ids/diagnosis";
import type { Criterion, CriterionResult, CriterionStatus } from "./types";

/**
 * Category of diagnosis
 */
export type DiagnosisCategory = "pain" | "joint";

/**
 * Location criterion - criterion evaluated per anatomical location
 *
 * The criterion template uses ${side} and ${region} placeholders
 * that are resolved during evaluation.
 */
export interface LocationCriterion {
  /** Anatomical regions this criterion applies to */
  regions: readonly Region[];

  /** Criterion template with ${side} and ${region} placeholders */
  criterion: Criterion;
}

/**
 * Complete diagnosis definition
 *
 * Combines anamnesis (history) criteria with examination criteria
 * for a complete diagnostic rule.
 */
export interface DiagnosisDefinition {
  /** Unique diagnosis identifier */
  id: DiagnosisId;

  /** Human-readable name */
  name: string;

  /** German name for UI display */
  nameDE: string;

  /** Diagnosis category */
  category: DiagnosisCategory;

  /**
   * Anamnesis (history) criteria
   *
   * Evaluated globally using SQ questionnaire answers.
   * These criteria can be displayed in the anamnesis section
   * to show which questions are relevant.
   */
  anamnesis: Criterion;

  /**
   * Examination criteria
   *
   * Evaluated per-location (side × region).
   * Template variables ${side} and ${region} are resolved
   * during evaluation.
   */
  examination: LocationCriterion;

  /**
   * Cross-diagnosis dependency: this diagnosis requires at least one
   * of these other diagnoses to also be positive. If none are positive,
   * this diagnosis is overridden to negative in evaluateAllDiagnoses.
   *
   * Used for headache attributed to TMD (requires myalgia or arthralgia).
   */
  requires?: { anyOf: DiagnosisId[] };
}

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Result for a single anatomical location during criterion evaluation
 */
export interface CriteriaLocationResult {
  /** Side of the body */
  side: Side;

  /** Anatomical region */
  region: Region;

  /** Whether criteria are met at this location */
  isPositive: boolean;

  /** Evaluation status */
  status: CriterionStatus;

  /** Detailed examination result tree */
  examinationResult: CriterionResult;
}

/**
 * Complete diagnosis result
 *
 * Contains overall result plus detailed per-location breakdown
 * for full traceability.
 */
export interface DiagnosisEvaluationResult {
  /** The diagnosis that was evaluated */
  diagnosisId: DiagnosisId;

  /** Overall result: true if anamnesis AND at least one location positive */
  isPositive: boolean;

  /** Overall status considering all data availability */
  status: CriterionStatus;

  /** Whether anamnesis criteria are met */
  anamnesisMet: boolean;

  /** Anamnesis status */
  anamnesisStatus: CriterionStatus;

  /** Detailed anamnesis result tree */
  anamnesisResult: CriterionResult;

  /** Results for each evaluated location (side × region) */
  locationResults: CriteriaLocationResult[];

  /** Positive locations (convenience accessor) */
  positiveLocations: Array<{ side: Side; region: Region }>;
}

/**
 * Extracts positive locations from a diagnosis result
 */
export function getPositiveLocations(
  result: DiagnosisEvaluationResult
): Array<{ side: Side; region: Region }> {
  return result.locationResults
    .filter((loc) => loc.isPositive)
    .map(({ side, region }) => ({ side, region }));
}

/**
 * Checks if any location is positive
 */
export function hasAnyPositiveLocation(result: DiagnosisEvaluationResult): boolean {
  return result.locationResults.some((loc) => loc.isPositive);
}

/**
 * Checks if a specific location is positive
 */
export function isLocationPositive(
  result: DiagnosisEvaluationResult,
  side: Side,
  region: Region
): boolean {
  const loc = result.locationResults.find((l) => l.side === side && l.region === region);
  return loc?.isPositive ?? false;
}

/**
 * Gets the location result for a specific side and region
 */
export function getLocationResult(
  result: DiagnosisEvaluationResult,
  side: Side,
  region: Region
): CriteriaLocationResult | undefined {
  return result.locationResults.find((l) => l.side === side && l.region === region);
}
