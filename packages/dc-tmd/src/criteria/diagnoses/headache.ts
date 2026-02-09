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

import {
  and,
  any,
  familiarHeadacheDuringMovement,
  familiarHeadacheDuringOpening,
  field,
  getSiteRefsTemplate,
  or,
} from "../builders";
import { sq } from "../field-refs";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import type { Criterion } from "../types";

// ============================================================================
// ANAMNESIS CRITERIA
// ============================================================================

/**
 * Criterion A: Headache of any type in the temporal region
 * SQ5 = "yes"
 */
export const headacheInTemporalRegion: Criterion = field(sq("SQ5"), { equals: "yes" });

/**
 * Criterion B: Headache modified by jaw movement, function, or parafunction
 * Any of SQ7_A, SQ7_B, SQ7_C, SQ7_D = "yes"
 */
export const headacheModifiedByFunction: Criterion = any(
  [sq("SQ7_A"), sq("SQ7_B"), sq("SQ7_C"), sq("SQ7_D")],
  { equals: "yes" },
  {
    id: "headacheModified",
    label: "Kopfschmerz durch Kieferbewegung, -funktion oder Parafunktion modifiziert",
  }
);

export const HEADACHE_ANAMNESIS: Criterion = and(
  [headacheInTemporalRegion, headacheModifiedByFunction],
  {
    id: "headacheHistory",
    label: "Kopfschmerz-Anamnese",
  }
);

// ============================================================================
// EXAMINATION CRITERIA (per-location, region = temporalis)
// ============================================================================

/**
 * Criterion C: Confirmation of headache location in temporalis
 * E1b headache location on ${side} includes "temporalis"
 */
const headacheLocationConfirmed: Criterion = field("e1.headacheLocation.${side}", {
  includes: "temporalis",
});

/**
 * Criterion D: Familiar headache in temporalis provoked by ONE of:
 * - E4 opening (familiar headache)
 * - E5 lateral/protrusive movements (familiar headache)
 * - E9 temporalis palpation (familiar headache)
 */
const familiarHeadacheProvoked: Criterion = or(
  [
    familiarHeadacheDuringOpening("${side}", "temporalis", {
      id: "openingFamiliarHeadache",
      label: "Bekannter Kopfschmerz bei Mundöffnung",
    }),
    familiarHeadacheDuringMovement("${side}", "temporalis", {
      id: "movementFamiliarHeadache",
      label: "Bekannter Kopfschmerz bei Lateral-/Protrusionsbewegung",
    }),
    any(getSiteRefsTemplate("temporalis", "familiarHeadache"), { equals: "yes" }, {
      id: "temporalisPalpationFamiliarHeadache",
      label: "Bekannter Kopfschmerz bei Palpation",
    }),
  ],
  {
    id: "familiarHeadache",
    label: "Bekannter Kopfschmerz bei Öffnung, Bewegung oder Palpation",
  }
);

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
