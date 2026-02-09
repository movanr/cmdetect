/**
 * Myalgia Subtype Diagnosis Definitions
 *
 * DC/TMD diagnostic criteria for the three mutually exclusive myalgia subtypes:
 * - Local Myalgia: pain remains local to palpation site
 * - Myofascial Pain with Spreading: pain spreads within muscle boundary
 * - Myofascial Pain with Referral: pain refers beyond muscle boundary
 *
 * All subtypes require:
 * - Positive base myalgia anamnesis (criteria A+B)
 * - Pain location confirmation in muscle (criterion C, via E1)
 * - Familiar pain specifically from palpation (criterion D, via E9 only — NOT E4 opening)
 * - 5-second palpation (standard mode) for spreading/referred assessment
 *
 * Subtypes are differentiated by pain pattern during palpation:
 * - Local: no spreading, no referred
 * - Spreading: spreading present, no referred
 * - Referral: referred present (spreading may or may not be present)
 *
 * The region-gated pattern (match + OR) ensures that spreading/referred checks
 * are specific to the region being evaluated, preventing false positives from
 * cross-region data contamination.
 *
 * Reference: Schiffman E, et al. (2014) Diagnostic Criteria for Temporomandibular
 * Disorders (DC/TMD) for Clinical and Research Applications.
 * Journal of Oral & Facial Pain and Headache, 28:6-27
 */

import { SITES_BY_GROUP, type PainType, type Region } from "../../ids/anatomy";
import { and, any, field, match, not, or } from "../builders";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import type { Criterion } from "../types";
import { MYALGIA_ANAMNESIS } from "./myalgia";

// Regions applicable to myalgia subtypes (same as base myalgia)
const MYALGIA_REGIONS: readonly Region[] = ["temporalis", "masseter"];

// ============================================================================
// SHARED HELPERS
// ============================================================================

/**
 * Criterion C: Confirmation of pain location in temporalis or masseter muscle
 * E1 pain location on ${side} includes ${region}
 *
 * Same as base myalgia — uses template variables resolved during evaluation.
 */
const painLocationConfirmed: Criterion = field("e1.painLocation.${side}", {
  includes: "${region}",
});

/**
 * Generate E9 palpation site refs for a specific region and pain type.
 *
 * Expands a region into its constituent palpation sites with ${side} template.
 * e.g., siteRefs("temporalis", "familiarPain") →
 *   ["e9.${side}.temporalisPosterior.familiarPain",
 *    "e9.${side}.temporalisMiddle.familiarPain",
 *    "e9.${side}.temporalisAnterior.familiarPain"]
 */
function siteRefs(region: Region, painType: PainType): string[] {
  return SITES_BY_GROUP[region].map((site) => `e9.\${side}.${site}.${painType}`);
}

/**
 * Creates a region-specific criterion branch wrapped in a match gate.
 *
 * The match("${region}", region) gate ensures the branch only evaluates
 * to positive when the evaluation context's region matches. This prevents
 * cross-region contamination in negative checks (spreading/referred).
 *
 * When evaluating for e.g. (left, temporalis):
 * - match("${region}", "temporalis") → positive → rest of AND evaluated
 * - match("${region}", "masseter")  → negative → AND short-circuits
 */
function regionGated(region: Region, criteria: Criterion[]): Criterion {
  return and([match("${region}", region), ...criteria]);
}

/**
 * Creates an OR over all myalgia regions with region-gated criteria.
 *
 * Only the branch matching the current evaluation region activates.
 * This is the core pattern enabling region-specific negative checks
 * for the myalgia subtypes.
 */
function forEachRegion(
  buildCriteria: (region: Region) => Criterion[],
  metadata?: { id?: string; label?: string }
): Criterion {
  return or(
    MYALGIA_REGIONS.map((region) => regionGated(region, buildCriteria(region))),
    metadata
  );
}

// ============================================================================
// LOCAL MYALGIA
// ============================================================================

/**
 * Local Myalgia Examination Criteria:
 * C. Pain location confirmed in muscle (E1)
 * D. Familiar pain from palpation (E9 only, NOT E4 opening)
 * E. Pain remains local: no spreading AND no referred pain
 *
 * Sensitivity/Specificity: Not established
 */
const localMyalgiaExamCriterion: Criterion = and(
  [
    painLocationConfirmed,
    forEachRegion(
      (region) => [
        // D: Familiar pain from palpation of any site in the muscle group
        any(siteRefs(region, "familiarPain"), { equals: "yes" }, {
          id: `${region}PalpationFamiliar`,
          label: "Bekannter Schmerz bei Palpation",
        }),
        // E: No spreading pain at any site in the muscle group
        not(
          any(siteRefs(region, "spreadingPain"), { equals: "yes" }),
          { id: `${region}NoSpreading`, label: "Kein ausbreitender Schmerz" }
        ),
        // E: No referred pain at any site in the muscle group
        not(
          any(siteRefs(region, "referredPain"), { equals: "yes" }),
          { id: `${region}NoReferred`, label: "Kein übertragener Schmerz" }
        ),
      ],
      {
        id: "localMyalgiaPalpation",
        label: "Palpation: bekannter Schmerz, lokal begrenzt",
      }
    ),
  ],
  {
    id: "localMyalgiaExam",
    label: "Lokale Myalgie-Untersuchungsbefund",
  }
);

export const LOCAL_MYALGIA_EXAMINATION: LocationCriterion = {
  regions: MYALGIA_REGIONS,
  criterion: localMyalgiaExamCriterion,
};

export const LOCAL_MYALGIA: DiagnosisDefinition = {
  id: "localMyalgia",
  name: "Local Myalgia",
  nameDE: "Lokale Myalgie",
  category: "pain",
  anamnesis: MYALGIA_ANAMNESIS,
  examination: LOCAL_MYALGIA_EXAMINATION,
};

// ============================================================================
// MYOFASCIAL PAIN WITH SPREADING
// ============================================================================

/**
 * Myofascial Pain with Spreading Examination Criteria:
 * C. Pain location confirmed in muscle (E1)
 * D. Familiar pain from palpation (E9 only)
 * E. Spreading pain present (within muscle boundary)
 * F. No referred pain (beyond muscle boundary)
 *
 * Sensitivity/Specificity: Not established
 */
const spreadingMyalgiaExamCriterion: Criterion = and(
  [
    painLocationConfirmed,
    forEachRegion(
      (region) => [
        // D: Familiar pain from palpation
        any(siteRefs(region, "familiarPain"), { equals: "yes" }, {
          id: `${region}PalpationFamiliar`,
          label: "Bekannter Schmerz bei Palpation",
        }),
        // E: Spreading pain present at any site in the muscle group
        any(siteRefs(region, "spreadingPain"), { equals: "yes" }, {
          id: `${region}SpreadingPain`,
          label: "Ausbreitender Schmerz vorhanden",
        }),
        // F: No referred pain at any site in the muscle group
        not(
          any(siteRefs(region, "referredPain"), { equals: "yes" }),
          { id: `${region}NoReferred`, label: "Kein übertragener Schmerz" }
        ),
      ],
      {
        id: "spreadingMyalgiaPalpation",
        label: "Palpation: bekannter Schmerz mit Ausbreitung",
      }
    ),
  ],
  {
    id: "spreadingMyalgiaExam",
    label: "Myofaszialer Schmerz-Untersuchungsbefund",
  }
);

export const MYOFASCIAL_SPREADING_EXAMINATION: LocationCriterion = {
  regions: MYALGIA_REGIONS,
  criterion: spreadingMyalgiaExamCriterion,
};

export const MYOFASCIAL_PAIN_WITH_SPREADING: DiagnosisDefinition = {
  id: "myofascialPainWithSpreading",
  name: "Myofascial Pain with Spreading",
  nameDE: "Myofaszialer Schmerz",
  category: "pain",
  anamnesis: MYALGIA_ANAMNESIS,
  examination: MYOFASCIAL_SPREADING_EXAMINATION,
};

// ============================================================================
// MYOFASCIAL PAIN WITH REFERRAL
// ============================================================================

/**
 * Myofascial Pain with Referral Examination Criteria:
 * C. Pain location confirmed in muscle (E1)
 * D. Familiar pain from palpation (E9 only)
 * E. Referred pain present (beyond muscle boundary)
 *
 * Sensitivity: 0.86 / Specificity: 0.98
 */
const referralMyalgiaExamCriterion: Criterion = and(
  [
    painLocationConfirmed,
    forEachRegion(
      (region) => [
        // D: Familiar pain from palpation
        any(siteRefs(region, "familiarPain"), { equals: "yes" }, {
          id: `${region}PalpationFamiliar`,
          label: "Bekannter Schmerz bei Palpation",
        }),
        // E: Referred pain present at any site in the muscle group
        any(siteRefs(region, "referredPain"), { equals: "yes" }, {
          id: `${region}ReferredPain`,
          label: "Übertragener Schmerz vorhanden",
        }),
      ],
      {
        id: "referralMyalgiaPalpation",
        label: "Palpation: bekannter Schmerz mit Übertragung",
      }
    ),
  ],
  {
    id: "referralMyalgiaExam",
    label: "Myofaszialer Schmerz mit Übertragung-Untersuchungsbefund",
  }
);

export const MYOFASCIAL_REFERRAL_EXAMINATION: LocationCriterion = {
  regions: MYALGIA_REGIONS,
  criterion: referralMyalgiaExamCriterion,
};

export const MYOFASCIAL_PAIN_WITH_REFERRAL: DiagnosisDefinition = {
  id: "myofascialPainWithReferral",
  name: "Myofascial Pain with Referral",
  nameDE: "Myofaszialer Schmerz mit Übertragung",
  category: "pain",
  anamnesis: MYALGIA_ANAMNESIS,
  examination: MYOFASCIAL_REFERRAL_EXAMINATION,
};
