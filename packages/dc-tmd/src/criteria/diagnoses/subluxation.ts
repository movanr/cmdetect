/**
 * Subluxation Diagnosis Definition
 *
 * DC/TMD diagnostic criteria for Subluxation.
 *
 * Criteria Summary:
 * A. Jaw locking or catching in wide-open position (SQ13)
 * B. Inability to close mouth without special maneuver (SQ14)
 * C. Examination: if clinically observed, redirect to close required (E8, optional)
 *
 * Since the examination is optional per DC/TMD protocol, the exam criterion
 * is trivially positive (match on region "tmj").
 *
 * Sensitivity: 0.98 / Specificity: 1.0
 */

import type { DiagnosisDefinition, LocationCriterion } from "../location";
import { SUBLUXATION_ANAMNESIS, SUBLUXATION_SIDED_ANAMNESIS } from "./anamnesis-criteria";
import { subluxationExam } from "./examination-criteria";

// Re-export for backwards compatibility
export {
  jawLockingOpenPositionAnamnesis,
  unableToCloseWithoutManeuverAnamnesis,
  SUBLUXATION_ANAMNESIS,
  SUBLUXATION_SIDED_ANAMNESIS,
} from "./anamnesis-criteria";

// ============================================================================
// EXAMINATION CRITERIA
// ============================================================================

const SUBLUXATION_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: subluxationExam,
};

// ============================================================================
// COMPLETE DIAGNOSIS DEFINITION
// ============================================================================

export const SUBLUXATION: DiagnosisDefinition = {
  id: "subluxation",
  name: "Subluxation",
  nameDE: "Subluxation",
  category: "joint",
  anamnesis: SUBLUXATION_ANAMNESIS,
  sidedAnamnesis: SUBLUXATION_SIDED_ANAMNESIS,
  examination: SUBLUXATION_EXAMINATION,
};
