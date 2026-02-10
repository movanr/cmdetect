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

import { any, or } from "../builders";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import { TMJ_NOISE_ANAMNESIS, TMJ_NOISE_SIDED_ANAMNESIS } from "./disc-displacement";

// ============================================================================
// EXAMINATION CRITERIA
// ============================================================================

/**
 * Crepitus detected by examiner during opening/closing (E6) or
 * lateral/protrusive movements (E7)
 */
const crepitusByExaminer = or(
  [
    any(
      [
        "e6.${side}.crepitus.examinerOpen",
        "e6.${side}.crepitus.examinerClose",
      ],
      { equals: "yes" },
      { id: "e6Crepitus", label: "Reiben bei Öffnung/Schließung" }
    ),
    any(
      [
        "e7.${side}.crepitus.examiner",
      ],
      { equals: "yes" },
      { id: "e7Crepitus", label: "Reiben bei Lateralbewegung" }
    ),
  ],
  {
    id: "crepitusByExaminer",
    label: "Reiben vom Untersucher festgestellt",
  }
);

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
