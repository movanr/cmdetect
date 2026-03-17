/**
 * Anamnesis Building-Block Criteria
 *
 * All anamnesis criteria used across DC/TMD diagnostic definitions.
 * Diagnosis files import these building blocks and compose DiagnosisDefinitions.
 */

import { and, any, field, or } from "../builders";
import { sq, sqSide } from "../field-refs";
import type { Criterion } from "../types";

// ============================================================================
// INDIVIDUAL BUILDING BLOCKS
// ============================================================================

/**
 * Criterion A (Myalgia/Arthralgia): Pain in jaw, temple, in ear, or in front of ear
 * SQ1 = "yes" AND SQ3 ∈ ["intermittent", "continuous"]
 */
export const painInMasticatoryStructure: Criterion = and(
  [
    field(sq("SQ1"), { equals: "yes" }),
    or([field(sq("SQ3"), { equals: "intermittent" }), field(sq("SQ3"), { equals: "continuous" })]),
  ],
  {
    id: "painInMasticatory",
    label: "Schmerz in einer mastikatorischen Struktur",
    sources: ["SF1", "SF3"],
  }
);

/**
 * Criterion B (Myalgia/Arthralgia): Pain modified by jaw movement, function, or parafunction
 * Any of SQ4_A, SQ4_B, SQ4_C, SQ4_D = "yes"
 */
export const painModifiedByFunction: Criterion = any(
  [sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")],
  { equals: "yes" },
  {
    id: "painModified",
    label: "Schmerz, der durch Kieferbewegungen, Funktion oder Parafunktion modifiziert wird",
    sources: ["SF4"],
  }
);

/**
 * Criterion A (Headache): Headache of any type in the temporal region
 * SQ5 = "yes"
 */
export const headacheInTemporalRegion: Criterion = field(sq("SQ5"), { equals: "yes" }, {
  id: "headacheInTemporalRegion",
  label: "Kopfschmerzen jeglicher Art in der Temporalregion",
  sources: ["SF5"],
});

/**
 * Criterion B (Headache): Headache modified by jaw movement, function, or parafunction
 * Any of SQ7_A, SQ7_B, SQ7_C, SQ7_D = "yes"
 */
export const headacheModifiedByFunction: Criterion = any(
  [sq("SQ7_A"), sq("SQ7_B"), sq("SQ7_C"), sq("SQ7_D")],
  { equals: "yes" },
  {
    id: "headacheModified",
    label: "Kopfschmerzen, die durch Kieferbewegungen, Funktion oder Parafunktion beeinflusst werden",
    sources: ["SF7"],
  }
);

/**
 * TMJ noise anamnesis shared by DD with Reduction and Degenerative Joint Disease.
 *
 * Per DC/TMD: "history of noise present in the TMJ during jaw movement,
 * OR patient reports noise during examination"
 *
 * SQ8 = "yes" OR any patient-reported noise during E6/E7
 */
export const TMJ_NOISE_ANAMNESIS: Criterion = or(
  [
    field(sq("SQ8"), { equals: "yes" }),
    // Patient reports noise during E6 (opening/closing)
    any(
      [
        "e6.left.click.patient",
        "e6.right.click.patient",
        "e6.left.crepitus.patient",
        "e6.right.crepitus.patient",
      ],
      { equals: "yes" },
      { id: "e6PatientNoise" }
    ),
    // Patient reports noise during E7 (lateral/protrusive)
    any(
      [
        "e7.left.click.patient",
        "e7.right.click.patient",
        "e7.left.crepitus.patient",
        "e7.right.crepitus.patient",
      ],
      { equals: "yes" },
      { id: "e7PatientNoise" }
    ),
  ],
  {
    id: "tmjNoiseAnamnesis",
    label: "Anamnestisch aktuell vorhandenes KG-Geräusch, oder Patient gibt während der Untersuchung Geräusche an",
    sources: ["SF8", "U6", "U7"],
  }
);

/**
 * SQ11 + SQ12: Intermittent locking — locking occurred in last 30 days (SQ11=yes)
 * AND not currently locked, i.e. the locking resolved (SQ12=no).
 */
export const intermittentLockingAnamnesis: Criterion = and([
  field(sq("SQ11"), { equals: "yes" }),
  field(sq("SQ12"), { equals: "no" }),
], {
  id: "intermittentLocking",
  label: "Aktuell intermittierende Blockade mit eingeschränkter Mundöffnung",
  sources: ["SF11", "SF12"],
});

/**
 * SQ9: Jaw ever locked/caught with limited opening.
 */
export const jawLockingAnamnesis: Criterion = field(sq("SQ9"), { equals: "yes" }, {
  id: "jawLocking",
  label: "Aktuell KG-Blockade mit eingeschränkter Mundöffnung",
  sources: ["SF9"],
});

/**
 * SQ10: Limitation severe enough to affect eating.
 */
export const lockingAffectsEatingAnamnesis: Criterion = field(sq("SQ10"), { equals: "yes" }, {
  id: "lockingAffectsEating",
  label: "Einschränkung schwer genug, um die Fähigkeit zu Essen zu beeinträchtigen",
  sources: ["SF10"],
});

/**
 * SQ13: Jaw locking or catching in wide-open position.
 */
export const jawLockingOpenPositionAnamnesis: Criterion = field(sq("SQ13"), { equals: "yes" }, {
  id: "jawLockingOpenPosition",
  label: "KG-Arretierung oder Hängen bleiben bei weit geöffneter Kieferposition",
  sources: ["SF13"],
});

/**
 * SQ14: Inability to close mouth without special maneuver.
 */
export const unableToCloseWithoutManeuverAnamnesis: Criterion = field(sq("SQ14"), { equals: "yes" }, {
  id: "unableToCloseWithoutManeuver",
  label: "Unfähigkeit den Mund ohne spezielles Umlenken zu schließen",
  sources: ["SF14"],
});

// ============================================================================
// COMPOSED ANAMNESIS (AND wrappers)
// ============================================================================

/**
 * Complete anamnesis criteria for Myalgia: A + B
 */
export const MYALGIA_ANAMNESIS: Criterion = and(
  [painInMasticatoryStructure, painModifiedByFunction],
  {
    id: "myalgiaHistory",
    label: "Myalgie-Anamnese",
  }
);

/**
 * Arthralgia anamnesis — same building blocks as myalgia (A+B)
 */
export const ARTHRALGIA_ANAMNESIS: Criterion = and(
  [painInMasticatoryStructure, painModifiedByFunction],
  {
    id: "arthralgiaHistory",
    label: "Arthralgie-Anamnese",
  }
);

/**
 * Headache anamnesis: A + B
 */
export const HEADACHE_ANAMNESIS: Criterion = and(
  [headacheInTemporalRegion, headacheModifiedByFunction],
  {
    id: "headacheHistory",
    label: "Kopfschmerz-Anamnese",
  }
);

/**
 * DD with Reduction + Intermittent Locking anamnesis: TMJ noise + intermittent locking
 */
export const DD_WITH_REDUCTION_IL_ANAMNESIS: Criterion = and(
  [
    TMJ_NOISE_ANAMNESIS,
    intermittentLockingAnamnesis,
  ],
  {
    id: "ddIntermittentLockingHistory",
    label: "DV mit Reposition und intermittierender Kieferklemme-Anamnese",
  }
);

/**
 * DD without Reduction anamnesis (both variants): SQ9 + SQ10
 */
export const DD_WITHOUT_REDUCTION_ANAMNESIS: Criterion = and(
  [jawLockingAnamnesis, lockingAffectsEatingAnamnesis],
  {
    id: "ddWithoutReductionHistory",
    label: "DV ohne Reposition-Anamnese",
  }
);

/**
 * Subluxation anamnesis: SQ13 + SQ14
 */
export const SUBLUXATION_ANAMNESIS: Criterion = and(
  [jawLockingOpenPositionAnamnesis, unableToCloseWithoutManeuverAnamnesis],
  {
    id: "subluxationHistory",
    label: "Subluxation-Anamnese",
  }
);

// ============================================================================
// SIDED ANAMNESIS CRITERIA (per-side gates)
// ============================================================================

/**
 * Per-side gate for TMJ noise diagnoses (DD with Reduction, DJD).
 *
 * Evaluated per-location with ${side} template context.
 * Positive if:
 * - SQ8 office-use marks this side, OR
 * - Patient reported noise on this side during E6/E7
 */
export const TMJ_NOISE_SIDED_ANAMNESIS: Criterion = or(
  [
    field(sqSide("SQ8"), { equals: true }),
    any(
      [
        "e6.${side}.click.patient",
        "e6.${side}.crepitus.patient",
        "e7.${side}.click.patient",
        "e7.${side}.crepitus.patient",
      ],
      { equals: "yes" },
      { id: "patientNoiseSided" }
    ),
  ],
  {
    id: "tmjNoiseSidedAnamnesis",
    label: "KG-Geräusch",
    sources: ["SF8", "U6", "U7"],
  }
);

/**
 * Per-side gate for DD without Reduction (both variants).
 * Both SQ9 and SQ10 office-use must match the side.
 */
export const DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS: Criterion = and(
  [
    field(sqSide("SQ9"), { equals: true }, {
      id: "jawLockingSided",
      label: "KG-Blockade",
      sources: ["SF9"],
    }),
    field(sqSide("SQ10"), { equals: true }, {
      id: "lockingAffectsEatingSided",
      label: "Einschränkung beim Essen",
      sources: ["SF10"],
    }),
  ],
  {
    id: "ddWithoutReductionSidedAnamnesis",
    label: "Kieferklemme",
    sources: ["SF9", "SF10"],
  }
);

/**
 * Sided anamnesis for DD with Reduction + Intermittent Locking:
 * TMJ noise side gate AND SQ11 office-use side must match.
 */
export const DD_WITH_REDUCTION_IL_SIDED_ANAMNESIS: Criterion = and(
  [
    TMJ_NOISE_SIDED_ANAMNESIS,
    field(sqSide("SQ11"), { equals: true }, {
      id: "intermittentLockingSided",
      label: "Intermittierende Kieferklemme",
      sources: ["SF11"],
    }),
  ],
  {
    id: "ddWithReductionILSidedAnamnesis",
    label: "KG-Geräusch und intermittierende Kieferklemme",
  }
);

/**
 * Per-side gate for Subluxation: both SQ13 and SQ14 office-use must match this side.
 */
export const SUBLUXATION_SIDED_ANAMNESIS: Criterion = and(
  [
    field(sqSide("SQ13"), { equals: true }, {
      id: "jawLockingOpenPositionSided",
      label: "KG-Arretierung bei weit geöffneter Position",
      sources: ["SF13"],
    }),
    field(sqSide("SQ14"), { equals: true }, {
      id: "unableToCloseWithoutManeuverSided",
      label: "Unfähigkeit den Mund ohne Umlenken zu schließen",
      sources: ["SF14"],
    }),
  ],
  {
    id: "subluxationSidedAnamnesis",
    label: "Subluxation",
    sources: ["SF13", "SF14"],
  }
);
