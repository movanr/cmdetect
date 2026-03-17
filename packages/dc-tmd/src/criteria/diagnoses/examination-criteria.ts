/**
 * Examination Building-Block Criteria
 *
 * All examination criteria used across DC/TMD diagnostic definitions.
 * Diagnosis files import these building blocks and compose DiagnosisDefinitions.
 */

import {
  E10_PALPATION_REGIONS,
  GROUP_CONFIG,
  SITES_BY_GROUP,
  SITE_CONFIG,
  type PainType,
  type Region,
} from "../../ids/anatomy";
import {
  and,
  any,
  computed,
  familiarHeadacheDuringMovement,
  familiarHeadacheDuringOpening,
  familiarPainDuringMovement,
  familiarPainDuringOpening,
  field,
  getSiteRefsTemplate,
  match,
  not,
  or,
} from "../builders";
import type { ChecklistCriterionMetadata, Criterion, CriterionMetadata, NamedCriterion } from "../types";

// ============================================================================
// MYALGIA HELPERS
// ============================================================================

/** Regions applicable to myalgia (temporalis, masseter, otherMast, nonMast) */
export const MYALGIA_REGIONS: readonly Region[] = ["temporalis", "masseter", "otherMast", "nonMast"];

/**
 * Generate palpation site refs for a specific region with ${side} template.
 * Section prefix (e9/e10) is determined automatically from SITE_CONFIG.
 */
export function siteRefs(region: Region, painType: PainType): string[] {
  // E10 regions: use ${site} template for per-site evaluation
  if (E10_PALPATION_REGIONS.includes(region)) {
    const section = SITE_CONFIG[SITES_BY_GROUP[region][0]].section;
    return [`${section}.\${side}.\${site}.${painType}`];
  }
  // E9 regions: expand all sites in the group
  return SITES_BY_GROUP[region].map(
    (site) => `${SITE_CONFIG[site].section}.\${side}.${site}.${painType}`
  );
}

/**
 * Region-gated criterion branch: only activates when evaluation context matches.
 *
 * When evaluating for e.g. (left, temporalis):
 * - match("${region}", "temporalis") → positive → rest of AND evaluated
 * - match("${region}", "masseter")  → negative → AND short-circuits
 */
export function regionGated(region: Region, criteria: Criterion[]): Criterion {
  return and([match("${region}", region), ...criteria]);
}

/**
 * OR over all myalgia regions with region-gated criteria.
 * Only the branch matching the current evaluation region activates.
 */
export function forEachRegion(
  buildCriteria: (region: Region) => Criterion[],
  metadata: ChecklistCriterionMetadata
): NamedCriterion;
export function forEachRegion(
  buildCriteria: (region: Region) => Criterion[],
  metadata?: CriterionMetadata
): Criterion;
export function forEachRegion(
  buildCriteria: (region: Region) => Criterion[],
  metadata?: CriterionMetadata
): Criterion {
  return or(
    MYALGIA_REGIONS.map((region) => regionGated(region, buildCriteria(region))),
    metadata
  );
}

/**
 * Generate spreading site refs, returning empty array for regions without spreading.
 *
 * For regions where GROUP_CONFIG.hasSpreading is false (tmj, otherMast, nonMast),
 * returns [] so that any([], ...) evaluates to negative (no matching refs possible).
 */
export function spreadingSiteRefs(region: Region): string[] {
  if (!GROUP_CONFIG[region].hasSpreading) return [];
  return siteRefs(region, "spreadingPain");
}

// ============================================================================
// MYALGIA EXAMINATION CRITERIA
// ============================================================================

/**
 * Criterion C: Confirmation of pain location in temporalis or masseter muscle
 * E1 pain location on ${side} includes ${region}
 */
export const painLocationConfirmed: NamedCriterion = field("e1.painLocation.${side}", {
  includes: "${region}",
}, {
  id: "painLocationConfirmed",
  label: "Bestätigung von Schmerzen in Kaumuskel(n)",
  sources: ["U1A"],
});

/**
 * Criterion D: Familiar pain provoked by ONE of:
 * - Palpation of muscle (E9 for temporalis/masseter, E10 for otherMast/nonMast)
 * - Maximum unassisted or assisted opening (E4b, E4c)
 *
 * Region-gated: only evaluates sites matching the current evaluation region.
 */
export const familiarPainProvoked: NamedCriterion = forEachRegion(
  (region) => [
    or(
      [
        // E4: Familiar pain during opening movements
        familiarPainDuringOpening("${side}", region, {
          id: "openingFamiliarPain",
          label: "Bekannter Schmerz bei Mundöffnung",
          sources: ["U4B", "U4C"],
        }),
        // E9/E10: Familiar pain during palpation of any site in the muscle group
        any(siteRefs(region, "familiarPain"), { equals: "yes" }, {
          id: `${region}PalpationFamiliar`,
          label: "Bekannter Schmerz bei Palpation",
          sources: ["U9", "U10"],
        }),
      ],
      {
        id: "familiarPainOr",
        label: "Bekannter Schmerz in Kaumuskel(n) bei Muskelpalpation oder maximaler Öffnung",
      }
    ),
  ],
  {
    id: "familiarPain",
    label: "Bekannter Schmerz in Kaumuskel(n) bei Muskelpalpation oder maximaler Öffnung",
    sources: ["U4B", "U4C", "U9", "U10"],
  }
);

// ============================================================================
// ARTHRALGIA EXAMINATION CRITERIA
// ============================================================================

/**
 * Criterion C: Confirmation of pain location in TMJ
 * E1 pain location on ${side} includes "tmj"
 */
export const painLocationConfirmedTmj: NamedCriterion = field("e1.painLocation.${side}", {
  includes: "tmj",
}, {
  id: "painLocationConfirmedTmj",
  label: "Bestätigung von Schmerzen in Kiefergelenk(en)",
  sources: ["U1A"],
});

/**
 * Criterion D: Familiar pain in TMJ provoked by ONE of:
 * - E4 opening (maxUnassisted or maxAssisted)
 * - E5 lateral/protrusive movements
 * - E9 TMJ palpation (lateral pole or around lateral pole)
 */
export const familiarPainProvokedTmj: NamedCriterion = or(
  [
    familiarPainDuringOpening("${side}", "tmj", {
      id: "openingFamiliarPainTmj",
      label: "Bekannter Schmerz bei Mundöffnung (KG)",
      sources: ["U4B", "U4C"],
    }),
    familiarPainDuringMovement("${side}", "tmj", {
      id: "movementFamiliarPainTmj",
      label: "Bekannter Schmerz bei Lateral-/Protrusionsbewegung (KG)",
      sources: ["U5A", "U5B", "U5C"],
    }),
    any(getSiteRefsTemplate("tmj", "familiarPain"), { equals: "yes" }, {
      id: "tmjPalpationFamiliarPain",
      label: "Bekannter Schmerz bei Palpation (KG)",
      sources: ["U9"],
    }),
  ],
  {
    id: "familiarPainTmj",
    label: "Bekannte Schmerzen des Kiefergelenks bei Palpation oder Kieferbewegungen",
    sources: ["U4B", "U4C", "U5A", "U5B", "U5C", "U9"],
  }
);

// ============================================================================
// HEADACHE EXAMINATION CRITERIA
// ============================================================================

/**
 * Criterion C: Confirmation of headache location in temporalis
 * E1b headache location on ${side} includes "temporalis"
 */
export const headacheLocationConfirmed: NamedCriterion = field("e1.headacheLocation.${side}", {
  includes: "temporalis",
}, {
  id: "headacheLocationConfirmed",
  label: "Bestätigung von Kopfschmerzen im M. temporalis",
  sources: ["U1B"],
});

/**
 * Criterion D: Familiar headache in temporalis provoked by ONE of:
 * - E4 opening (familiar headache)
 * - E5 lateral/protrusive movements (familiar headache)
 * - E9 temporalis palpation (familiar headache)
 */
export const familiarHeadacheProvoked: NamedCriterion = or(
  [
    familiarHeadacheDuringOpening("${side}", "temporalis", {
      id: "openingFamiliarHeadache",
      label: "Bekannter Kopfschmerz bei Mundöffnung",
      sources: ["U4B", "U4C"],
    }),
    familiarHeadacheDuringMovement("${side}", "temporalis", {
      id: "movementFamiliarHeadache",
      label: "Bekannter Kopfschmerz bei Lateral-/Protrusionsbewegung",
      sources: ["U5A", "U5B", "U5C"],
    }),
    any(getSiteRefsTemplate("temporalis", "familiarHeadache"), { equals: "yes" }, {
      id: "temporalisPalpationFamiliarHeadache",
      label: "Bekannter Kopfschmerz bei Palpation",
      sources: ["U9"],
    }),
  ],
  {
    id: "familiarHeadache",
    label: "Angabe von bekanntem Kopfschmerz in der Temporalisregion durch Palpation des M. temporalis oder Kieferbewegungen",
    sources: ["U4B", "U4C", "U5A", "U5B", "U5C", "U9"],
  }
);

// ============================================================================
// DISC DISPLACEMENT EXAMINATION CRITERIA
// ============================================================================

/**
 * DD with Reduction examination:
 * Either:
 * a) E6 click on opening AND E6 click on closing (same side)
 * OR
 * b) E6 click on opening OR closing AND E7 click (same side)
 */
export const ddWithReductionExam: NamedCriterion = or(
  [
    // a) Click during both opening AND closing
    and([
      field("e6.${side}.click.examinerOpen", { equals: "yes" }),
      field("e6.${side}.click.examinerClose", { equals: "yes" }),
    ], { id: "openCloseClick", label: "Knacken beim Öffnen und Schließen", sources: ["U6"] }),
    // b) Click during opening or closing AND click during lateral/protrusive
    and([
      or([
        field("e6.${side}.click.examinerOpen", { equals: "yes" }),
        field("e6.${side}.click.examinerClose", { equals: "yes" }),
      ]),
      field("e7.${side}.click.examiner", { equals: "yes" }),
    ], { id: "openOrCloseAndLateralClick", label: "Knacken beim Öffnen oder Schließen und Knacken bei Laterotrusion oder Protrusion", sources: ["U6", "U7"] }),
  ],
  {
    id: "ddWithReductionExam",
    label: "Diskusverlagerung mit Reposition-Untersuchungsbefund",
    sources: ["U6", "U7"],
  }
);

/**
 * Examination: maxAssisted opening + vertical overlap < 40mm
 */
export const passiveStretchLimited: NamedCriterion = computed(
  ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
  (v) =>
    ((v["e4.maxAssisted.measurement"] as number) ?? 0) +
    ((v["e2.verticalOverlap"] as number) ?? 0),
  "<",
  40,
  {
    id: "passiveStretchLimited",
    label: "Passive Dehnung (maximale passive Mundöffnung) < 40mm",
    sources: ["U2", "U4C"],
    defaults: { "e2.verticalOverlap": 0 },
  }
);

/**
 * Examination: maxAssisted opening + vertical overlap >= 40mm
 */
export const passiveStretchNotLimited: NamedCriterion = computed(
  ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
  (v) =>
    ((v["e4.maxAssisted.measurement"] as number) ?? 0) +
    ((v["e2.verticalOverlap"] as number) ?? 0),
  ">=",
  40,
  {
    id: "passiveStretchNotLimited",
    label: "Passive Dehnung (maximale passive Mundöffnung) \u2265 40mm",
    sources: ["U2", "U4C"],
    defaults: { "e2.verticalOverlap": 0 },
  }
);

// ============================================================================
// DEGENERATIVE JOINT DISEASE EXAMINATION CRITERIA
// ============================================================================

/**
 * Crepitus detected by examiner during opening/closing (E6) or
 * lateral/protrusive movements (E7)
 */
export const crepitusByExaminer: NamedCriterion = or(
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
    label: "Reiben bei Kieferbewegungen",
    sources: ["U6", "U7"],
  }
);

// ============================================================================
// SUBLUXATION EXAMINATION CRITERIA
// ============================================================================

/**
 * Examination is optional per DC/TMD: "if disorder occurs clinically, redirect
 * to close mouth required (E8 optional)". Trivial match on TMJ region.
 */
export const subluxationExam: NamedCriterion = match("${region}", "tmj", {
  id: "subluxationExam",
  label: "Umlenken zum Mundschluss erforderlich (optional)",
  sources: ["U8"],
});

// ============================================================================
// MYALGIA SUBTYPE EXAMINATION CRITERIA
// ============================================================================

/**
 * Local Myalgia Examination Criteria:
 * C. Pain location confirmed in muscle (E1)
 * D. Familiar pain from palpation (E9 only, NOT E4 opening)
 * E. Pain remains local: no spreading AND no referred pain
 */
export const localMyalgiaExamCriterion: Criterion = and(
  [
    painLocationConfirmed,
    forEachRegion(
      (region) => [
        // D: Familiar pain from palpation of any site in the muscle group
        any(
          siteRefs(region, "familiarPain"),
          { equals: "yes" },
          {
            id: `${region}PalpationFamiliar`,
            label: "Bekannter Schmerz bei Muskelpalpation",
          }
        ),
        // E: No spreading pain at any site in the muscle group
        not(any(spreadingSiteRefs(region), { equals: "yes" }), {
          id: `${region}NoSpreading`,
          label: "Kein ausbreitender Schmerz",
        }),
        // E: No referred pain at any site in the muscle group
        not(any(siteRefs(region, "referredPain"), { equals: "yes" }), {
          id: `${region}NoReferred`,
          label: "Kein übertragener Schmerz",
        }),
      ],
      {
        id: "localMyalgiaPalpation",
        label: "Palpation: bekannter Schmerz, ohne Ausbreitung, ohne Übertragung",
        sources: ["U9", "U10"],
      }
    ),
  ],
  {
    id: "localMyalgiaExam",
    label: "Lokale Myalgie-Untersuchungsbefund",
  }
);

/**
 * Myofascial Pain with Spreading Examination Criteria:
 * C. Pain location confirmed in muscle (E1)
 * D. Familiar pain from palpation (E9 only)
 * E. Spreading pain present (within muscle boundary)
 * F. No referred pain (beyond muscle boundary)
 */
export const spreadingMyalgiaExamCriterion: Criterion = and(
  [
    painLocationConfirmed,
    forEachRegion(
      (region) => [
        // D: Familiar pain from palpation
        any(
          siteRefs(region, "familiarPain"),
          { equals: "yes" },
          {
            id: `${region}PalpationFamiliar`,
            label: "Bekannter Schmerz bei Muskelpalpation",
          }
        ),
        // E: Spreading pain present at any site in the muscle group
        any(
          spreadingSiteRefs(region),
          { equals: "yes" },
          {
            id: `${region}SpreadingPain`,
            label: "Ausbreitender Schmerz bei Muskelpalpation",
          }
        ),
        // F: No referred pain at any site in the muscle group
        not(any(siteRefs(region, "referredPain"), { equals: "yes" }), {
          id: `${region}NoReferred`,
          label: "Kein übertragener Schmerz",
        }),
      ],
      {
        id: "spreadingMyalgiaPalpation",
        label: "Palpation: bekannter Schmerz mit Ausbreitung, ohne Übertragung",
        sources: ["U9", "U10"],
      }
    ),
  ],
  {
    id: "spreadingMyalgiaExam",
    label: "Myofaszialer Schmerz-Untersuchungsbefund",
  }
);

/**
 * Myofascial Pain with Referral Examination Criteria:
 * C. Pain location confirmed in muscle (E1)
 * D. Familiar pain from palpation (E9 only)
 * E. Referred pain present (beyond muscle boundary)
 */
export const referralMyalgiaExamCriterion: Criterion = and(
  [
    painLocationConfirmed,
    forEachRegion(
      (region) => [
        // D: Familiar pain from palpation
        any(
          siteRefs(region, "familiarPain"),
          { equals: "yes" },
          {
            id: `${region}PalpationFamiliar`,
            label: "Bekannter Schmerz bei Muskelpalpation",
          }
        ),
        // E: Referred pain present at any site in the muscle group
        any(
          siteRefs(region, "referredPain"),
          { equals: "yes" },
          {
            id: `${region}ReferredPain`,
            label: "Übertragener Schmerz bei Muskelpalpation",
          }
        ),
      ],
      {
        id: "referralMyalgiaPalpation",
        label: "Palpation: bekannter Schmerz mit Übertragung",
        sources: ["U9", "U10"],
      }
    ),
  ],
  {
    id: "referralMyalgiaExam",
    label: "Myofaszialer Schmerz mit Übertragung-Untersuchungsbefund",
  }
);
