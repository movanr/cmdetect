/**
 * Disc Displacement Diagnosis Definitions (4 variants)
 *
 * DC/TMD diagnostic criteria for all disc displacement variants:
 * 1. DD with Reduction
 * 2. DD with Reduction + Intermittent Locking
 * 3. DD without Reduction, with Limited Opening
 * 4. DD without Reduction, without Limited Opening
 */

import { and, any, computed, field, or } from "../builders";
import { sq, sqSide } from "../field-refs";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import type { Criterion } from "../types";

// ============================================================================
// SHARED: TMJ NOISE ANAMNESIS
// ============================================================================

/**
 * TMJ noise anamnesis criterion shared by DD with Reduction and Degenerative Joint Disease.
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
  }
);

// ============================================================================
// SHARED: TMJ NOISE SIDED ANAMNESIS (per-side gate)
// ============================================================================

/**
 * Per-side gate for TMJ noise diagnoses (DD with Reduction, DJD).
 *
 * Evaluated per-location with ${side} template context.
 * Positive if:
 * - SQ8 office-use marks this side, OR
 * - Patient reported noise on this side during E6/E7
 *
 * This ensures the diagnosis is only positive on sides where
 * the patient history supports it.
 */
export const TMJ_NOISE_SIDED_ANAMNESIS: Criterion = or(
  [
    // Path 1: SQ8 office-use side matches this side
    field(sqSide("SQ8"), { equals: true }),
    // Path 2: Patient reported noise on this side during E6/E7
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
    label: "KG-Geräusch auf dieser Seite",
  }
);

// ============================================================================
// SHARED: DD WITHOUT REDUCTION SIDED ANAMNESIS (per-side gate)
// ============================================================================

/**
 * Per-side gate for DD without Reduction (both variants).
 *
 * Both SQ9 and SQ10 office-use must match the side.
 */
export const DD_WITHOUT_REDUCTION_SIDED_ANAMNESIS: Criterion = and(
  [
    field(sqSide("SQ9"), { equals: true }),
    field(sqSide("SQ10"), { equals: true }),
  ],
  {
    id: "ddWithoutReductionSidedAnamnesis",
    label: "Kieferklemme auf dieser Seite",
  }
);

// ============================================================================
// 1. DISC DISPLACEMENT WITH REDUCTION
// ============================================================================

/**
 * DD with Reduction examination:
 * Either:
 * a) E6 click on opening AND E6 click on closing (same side)
 * OR
 * b) E6 click on opening OR closing AND E7 click (same side)
 */
function ddWithReductionExamCriterion(): Criterion {
  return or(
    [
      // a) Click during both opening AND closing
      and([
        field("e6.${side}.click.examinerOpen", { equals: "yes" }),
        field("e6.${side}.click.examinerClose", { equals: "yes" }),
      ], { id: "openCloseClick", label: "Knacken beim Öffnen und Schließen" }),
      // b) Click during opening or closing AND click during lateral/protrusive
      and([
        or([
          field("e6.${side}.click.examinerOpen", { equals: "yes" }),
          field("e6.${side}.click.examinerClose", { equals: "yes" }),
        ]),
        field("e7.${side}.click.examiner", { equals: "yes" }),
      ], { id: "openOrCloseAndLateralClick", label: "Knacken beim Öffnen oder Schließen und Knacken bei Laterotrusion oder Protrusion" }),
    ],
    {
      id: "ddWithReductionExam",
      label: "Diskusverlagerung mit Reposition-Untersuchungsbefund",
    }
  );
}

const DD_WITH_REDUCTION_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: ddWithReductionExamCriterion(),
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
});

/**
 * Additional anamnesis: TMJ noise + intermittent locking
 */
const DD_WITH_REDUCTION_INTERMITTENT_LOCKING_ANAMNESIS: Criterion = and(
  [
    TMJ_NOISE_ANAMNESIS,
    intermittentLockingAnamnesis,
  ],
  {
    id: "ddIntermittentLockingHistory",
    label: "DV mit Reposition und intermittierender Kieferklemme-Anamnese",
  }
);

const DD_WITH_REDUCTION_INTERMITTENT_LOCKING_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: ddWithReductionExamCriterion(),
};

/**
 * Sided anamnesis for DD with Reduction + Intermittent Locking:
 * TMJ noise side gate AND SQ11 office-use side must match.
 */
const DD_WITH_REDUCTION_IL_SIDED_ANAMNESIS: Criterion = and(
  [
    TMJ_NOISE_SIDED_ANAMNESIS,
    field(sqSide("SQ11"), { equals: true }),
  ],
  {
    id: "ddWithReductionILSidedAnamnesis",
    label: "KG-Geräusch und intermittierende Kieferklemme auf dieser Seite",
  }
);

export const DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING: DiagnosisDefinition = {
  id: "discDisplacementWithReductionIntermittentLocking",
  name: "Disc Displacement with Reduction, with Intermittent Locking",
  nameDE: "Diskusverlagerung mit Reposition, mit intermittierender Kieferklemme",
  category: "joint",
  anamnesis: DD_WITH_REDUCTION_INTERMITTENT_LOCKING_ANAMNESIS,
  sidedAnamnesis: DD_WITH_REDUCTION_IL_SIDED_ANAMNESIS,
  examination: DD_WITH_REDUCTION_INTERMITTENT_LOCKING_EXAMINATION,
};

// ============================================================================
// SHARED: DD WITHOUT REDUCTION ANAMNESIS
// ============================================================================

/**
 * SQ9: Jaw ever locked/caught with limited opening.
 */
export const jawLockingAnamnesis: Criterion = field(sq("SQ9"), { equals: "yes" }, {
  id: "jawLocking",
  label: "Aktuell KG-Blockade mit eingeschränkter Mundöffnung",
});

/**
 * SQ10: Limitation severe enough to affect eating.
 */
export const lockingAffectsEatingAnamnesis: Criterion = field(sq("SQ10"), { equals: "yes" }, {
  id: "lockingAffectsEating",
  label: "Einschränkung schwer genug, um die Fähigkeit zu Essen zu beeinträchtigen",
});

/**
 * Anamnesis for DD without Reduction (both variants):
 * SQ9 = "yes" (jaw ever locked/caught)
 * SQ10 = "yes" (limitation severe enough to affect eating)
 */
export const DD_WITHOUT_REDUCTION_ANAMNESIS: Criterion = and(
  [jawLockingAnamnesis, lockingAffectsEatingAnamnesis],
  {
    id: "ddWithoutReductionHistory",
    label: "DV ohne Reposition-Anamnese",
  }
);

// ============================================================================
// 3. DD WITHOUT REDUCTION, WITH LIMITED OPENING
// ============================================================================

/**
 * Examination: maxAssisted opening + vertical overlap < 40mm
 *
 * computed sum of e4.maxAssisted.measurement + e2.verticalOverlap < 40
 */
const DD_WITHOUT_REDUCTION_LIMITED_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: computed(
    ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
    (v) =>
      ((v["e4.maxAssisted.measurement"] as number) ?? 0) +
      ((v["e2.verticalOverlap"] as number) ?? 0),
    "<",
    40,
    {
      id: "passiveStretchLimited",
      label: "Passive Dehnung (maximale passive Mundöffnung) < 40mm",
      defaults: { "e2.verticalOverlap": 0 },
    }
  ),
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

/**
 * Examination: maxAssisted opening + vertical overlap >= 40mm
 */
const DD_WITHOUT_REDUCTION_NO_LIMITED_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: computed(
    ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
    (v) =>
      ((v["e4.maxAssisted.measurement"] as number) ?? 0) +
      ((v["e2.verticalOverlap"] as number) ?? 0),
    ">=",
    40,
    {
      id: "passiveStretchNotLimited",
      label: "Passive Dehnung (maximale passive Mundöffnung) \u2265 40mm",
      defaults: { "e2.verticalOverlap": 0 },
    }
  ),
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
