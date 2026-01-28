/**
 * DC/TMD Result Types - Types for diagnostic evaluation results.
 *
 * These types define the region for representing:
 * - Examination findings at specific anatomical locations
 * - Diagnostic conclusions based on DC/TMD criteria
 */

import type { PalpationSite, Region, Side } from "../ids/anatomy";
import type { DiagnosisId } from "../ids/diagnosis";

/**
 * Represents a finding at a specific anatomical location.
 */
export interface LocationResult {
  side: Side;
  region?: Region;
  palpationSite?: PalpationSite;
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
