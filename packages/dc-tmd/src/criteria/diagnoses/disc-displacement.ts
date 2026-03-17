/**
 * Disc Displacement Diagnosis Definitions (4 variants)
 *
 * DC/TMD diagnostic criteria for all disc displacement variants:
 * 1. DD with Reduction
 * 2. DD with Reduction + Intermittent Locking
 * 3. DD without Reduction, with Limited Opening
 * 4. DD without Reduction, without Limited Opening
 */

import type { DiagnosisDefinition, LocationCriterion } from "../location";
import {
  DD_WITH_REDUCTION_IL_ANAMNESIS,
  DD_WITHOUT_REDUCTION_ANAMNESIS,
  DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS,
  DD_WITH_REDUCTION_IL_SIDED_ANAMNESIS,
  TMJ_NOISE_ANAMNESIS,
  TMJ_NOISE_SIDED_ANAMNESIS,
} from "./anamnesis-criteria";
import {
  ddWithReductionExam,
  passiveStretchLimited,
  passiveStretchNotLimited,
} from "./examination-criteria";

// Re-export for backwards compatibility
export {
  TMJ_NOISE_ANAMNESIS,
  TMJ_NOISE_SIDED_ANAMNESIS,
  DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS,
  DD_WITH_REDUCTION_IL_SIDED_ANAMNESIS,
  DD_WITH_REDUCTION_IL_ANAMNESIS,
  DD_WITHOUT_REDUCTION_ANAMNESIS,
  intermittentLockingAnamnesis,
  jawLockingAnamnesis,
  lockingAffectsEatingAnamnesis,
} from "./anamnesis-criteria";

// ============================================================================
// 1. DISC DISPLACEMENT WITH REDUCTION
// ============================================================================

const DD_WITH_REDUCTION_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: ddWithReductionExam,
};

export const DISC_DISPLACEMENT_WITH_REDUCTION: DiagnosisDefinition = {
  id: "discDisplacementWithReduction",
  name: "Disc Displacement with Reduction",
  nameDE: "Diskusverlagerung mit Reposition",
  category: "joint",
  anamnesis: TMJ_NOISE_ANAMNESIS,
  sidedAnamnesis: TMJ_NOISE_SIDED_ANAMNESIS,
  examination: DD_WITH_REDUCTION_EXAMINATION,
};

// ============================================================================
// 2. DD WITH REDUCTION + INTERMITTENT LOCKING
// ============================================================================

const DD_WITH_REDUCTION_INTERMITTENT_LOCKING_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: ddWithReductionExam,
};

export const DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING: DiagnosisDefinition = {
  id: "discDisplacementWithReductionIntermittentLocking",
  name: "Disc Displacement with Reduction, with Intermittent Locking",
  nameDE: "Diskusverlagerung mit Reposition, mit intermittierender Kieferklemme",
  category: "joint",
  anamnesis: DD_WITH_REDUCTION_IL_ANAMNESIS,
  sidedAnamnesis: DD_WITH_REDUCTION_IL_SIDED_ANAMNESIS,
  examination: DD_WITH_REDUCTION_INTERMITTENT_LOCKING_EXAMINATION,
};

// ============================================================================
// 3. DD WITHOUT REDUCTION, WITH LIMITED OPENING
// ============================================================================

const DD_WITHOUT_REDUCTION_LIMITED_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: passiveStretchLimited,
};

export const DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING: DiagnosisDefinition = {
  id: "discDisplacementWithoutReductionLimitedOpening",
  name: "Disc Displacement without Reduction, with Limited Opening",
  nameDE: "Diskusverlagerung ohne Reposition, mit Mundöffnungseinschränkung",
  category: "joint",
  anamnesis: DD_WITHOUT_REDUCTION_ANAMNESIS,
  sidedAnamnesis: DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS,
  examination: DD_WITHOUT_REDUCTION_LIMITED_EXAMINATION,
};

// ============================================================================
// 4. DD WITHOUT REDUCTION, WITHOUT LIMITED OPENING
// ============================================================================

const DD_WITHOUT_REDUCTION_NO_LIMITED_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: passiveStretchNotLimited,
};

export const DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING: DiagnosisDefinition = {
  id: "discDisplacementWithoutReductionWithoutLimitedOpening",
  name: "Disc Displacement without Reduction, without Limited Opening",
  nameDE: "Diskusverlagerung ohne Reposition, ohne Mundöffnungseinschränkung",
  category: "joint",
  anamnesis: DD_WITHOUT_REDUCTION_ANAMNESIS,
  sidedAnamnesis: DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS,
  examination: DD_WITHOUT_REDUCTION_NO_LIMITED_EXAMINATION,
};
