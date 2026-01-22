/**
 * DC/TMD Result Types - Types for diagnostic evaluation results.
 *
 * These types define the structure for representing:
 * - Examination findings at specific anatomical locations
 * - Diagnostic conclusions based on DC/TMD criteria
 */

import type { Side, Region, PalpationSite, MuscleGroup } from "../ids/anatomy";
import type { DiagnosisId } from "../ids/diagnosis";

/**
 * Represents a finding at a specific anatomical location.
 */
export interface LocationResult {
  side: Side;
  structure: "muscle" | "tmj";
  region?: Region;
  palpationSite?: PalpationSite;
  muscleGroup?: MuscleGroup;
  isPositive: boolean;
}

/**
 * Represents a diagnostic conclusion based on DC/TMD criteria.
 */
export interface DiagnosisResult {
  diagnosisId: DiagnosisId;
  isPositive: boolean;
  confidence?: "definite" | "probable" | "possible";
  locationResults: LocationResult[];
}

/**
 * Summary of all diagnostic results for a patient.
 */
export interface DiagnosisSummary {
  /** List of positive diagnoses */
  positiveDiagnoses: DiagnosisResult[];
  /** List of negative diagnoses (criteria not met) */
  negativeDiagnoses: DiagnosisResult[];
  /** Timestamp when evaluation was performed */
  evaluatedAt: Date;
}
