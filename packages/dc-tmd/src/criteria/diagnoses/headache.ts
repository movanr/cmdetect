/**
 * Headache Attributed to TMD Diagnosis Definition
 *
 * DC/TMD diagnostic criteria for Headache Attributed to TMD.
 *
 * IMPORTANT: This is a secondary diagnosis that requires a primary diagnosis
 * of either Myalgia or Arthralgia. This is enforced via the `requires` field.
 *
 * Criteria Summary:
 * A. Headache in temporal region (SQ5)
 * B. Headache modified by jaw movement/function (SQ7)
 * C. Confirmation of headache location in temporalis (E1b)
 * D. Familiar headache provoked by palpation (E9), opening (E4), or movement (E5)
 *
 * Sensitivity: 0.89 / Specificity: 0.87
 */

import { and } from "../builders";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import { HEADACHE_ANAMNESIS } from "./anamnesis-criteria";
import { familiarHeadacheProvoked, headacheLocationConfirmed } from "./examination-criteria";

// Re-export for backwards compatibility
export {
  headacheInTemporalRegion,
  headacheModifiedByFunction,
  HEADACHE_ANAMNESIS,
} from "./anamnesis-criteria";
export { headacheLocationConfirmed, familiarHeadacheProvoked } from "./examination-criteria";

// ============================================================================
// EXAMINATION (per-location, region = temporalis)
// ============================================================================

export const HEADACHE_EXAMINATION: LocationCriterion = {
  regions: ["temporalis"],
  criterion: and([headacheLocationConfirmed, familiarHeadacheProvoked], {
    id: "headacheExam",
    label: "Kopfschmerz-Untersuchungsbefund",
  }),
};

// ============================================================================
// COMPLETE DIAGNOSIS DEFINITION
// ============================================================================

export const HEADACHE_ATTRIBUTED_TO_TMD: DiagnosisDefinition = {
  id: "headacheAttributedToTmd",
  name: "Headache Attributed to TMD",
  nameDE: "Auf CMD zurückgeführte Kopfschmerzen",
  category: "pain",
  anamnesis: HEADACHE_ANAMNESIS,
  examination: HEADACHE_EXAMINATION,
  requires: { anyOf: ["myalgia", "arthralgia"] },
};
