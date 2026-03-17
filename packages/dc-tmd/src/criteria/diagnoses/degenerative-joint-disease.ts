/**
 * Degenerative Joint Disease Diagnosis Definition
 *
 * DC/TMD diagnostic criteria for Degenerative Joint Disease (DJD).
 *
 * Criteria Summary:
 * A. TMJ noise in history or patient-reported during exam (same as DD)
 * B. Crepitus detected by examiner during E6 or E7
 *
 * Sensitivity: 0.55 / Specificity: 0.61
 */

import type { DiagnosisDefinition, LocationCriterion } from "../location";
import { TMJ_NOISE_ANAMNESIS, TMJ_NOISE_SIDED_ANAMNESIS } from "./anamnesis-criteria";
import { crepitusByExaminer } from "./examination-criteria";

// ============================================================================
// EXAMINATION CRITERIA
// ============================================================================

const DJD_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: crepitusByExaminer,
};

// ============================================================================
// COMPLETE DIAGNOSIS DEFINITION
// ============================================================================

export const DEGENERATIVE_JOINT_DISEASE: DiagnosisDefinition = {
  id: "degenerativeJointDisease",
  name: "Degenerative Joint Disease",
  nameDE: "Degenerative Gelenkerkrankung",
  category: "joint",
  anamnesis: TMJ_NOISE_ANAMNESIS,
  sidedAnamnesis: TMJ_NOISE_SIDED_ANAMNESIS,
  examination: DJD_EXAMINATION,
};
