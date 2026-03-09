/**
 * Myalgia Diagnosis Definition
 *
 * DC/TMD diagnostic criteria for Myalgia (muscle pain).
 *
 * Reference: Schiffman E, et al. (2014) Diagnostic Criteria for Temporomandibular
 * Disorders (DC/TMD) for Clinical and Research Applications.
 * Journal of Oral & Facial Pain and Headache, 28:6-27
 *
 * Criteria Summary:
 * A. Pain in masticatory region (SQ history)
 * B. Pain modified by jaw movement/function (SQ history)
 * C. Confirmation of pain location in muscle (E1)
 * D. Familiar pain on palpation or movement (E4, E9)
 */

import { E10_PALPATION_REGIONS, SITES_BY_GROUP, SITE_CONFIG, type PainType, type Region } from "../../ids/anatomy";
import { and, any, familiarPainDuringOpening, field, match, or } from "../builders";
import { sq } from "../field-refs";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import type { Criterion, CriterionMetadata } from "../types";

// Regions applicable to myalgia (temporalis, masseter, otherMast, nonMast)
export const MYALGIA_REGIONS: readonly Region[] = ["temporalis", "masseter", "otherMast", "nonMast"];

// ============================================================================
// ANAMNESIS CRITERIA (SQ Questionnaire)
// ============================================================================

/**
 * Criterion A: Pain in jaw, temple, in ear, or in front of ear (masticatory structure)
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
 * Criterion B: Pain modified by jaw movement, function, or parafunction
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
 * Complete anamnesis criteria for Myalgia
 * Both A and B must be positive
 */
export const MYALGIA_ANAMNESIS: Criterion = and(
  [painInMasticatoryStructure, painModifiedByFunction],
  {
    id: "myalgiaHistory",
    label: "Myalgie-Anamnese",
  }
);

// ============================================================================
// EXAMINATION CRITERIA (per-location)
// ============================================================================

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
  metadata?: CriterionMetadata
): Criterion {
  return or(
    MYALGIA_REGIONS.map((region) => regionGated(region, buildCriteria(region))),
    metadata
  );
}

/**
 * Criterion C: Confirmation of pain location in temporalis or masseter muscle
 * E1 pain location on ${side} includes ${region}
 */
export const painLocationConfirmed: Criterion = field("e1.painLocation.${side}", {
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
 * Region-gated: only evaluates sites matching the current evaluation region,
 * preventing cross-region data contamination.
 */
export const familiarPainProvoked: Criterion = forEachRegion(
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

/**
 * Complete examination criteria for Myalgia (per-location)
 *
 * Evaluated for each combination of:
 * - side: left, right
 * - region: temporalis, masseter
 *
 * Both C and D must be positive for a location to be positive.
 */
export const MYALGIA_EXAMINATION: LocationCriterion = {
  regions: MYALGIA_REGIONS,
  criterion: and([painLocationConfirmed, familiarPainProvoked], {
    id: "myalgiaExam",
    label: "Myalgie-Untersuchungsbefund",
  }),
  siteExpansion: {
    otherMast: SITES_BY_GROUP.otherMast,
    nonMast: SITES_BY_GROUP.nonMast,
  },
};

// ============================================================================
// COMPLETE DIAGNOSIS DEFINITION
// ============================================================================

/**
 * Myalgia Diagnosis Definition
 *
 * A diagnosis of Myalgia requires:
 * 1. Positive anamnesis (history criteria A+B)
 * 2. At least one positive location (examination criteria C+D)
 */
export const MYALGIA: DiagnosisDefinition = {
  id: "myalgia",
  name: "Myalgia",
  nameDE: "Myalgie",
  category: "pain",
  anamnesis: MYALGIA_ANAMNESIS,
  examination: MYALGIA_EXAMINATION,
};
