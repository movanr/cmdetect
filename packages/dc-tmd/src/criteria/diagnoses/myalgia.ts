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

import { SITES_BY_GROUP } from "../../ids/anatomy";
import { and, any, familiarPainDuringOpening, field, or } from "../builders";
import { sq } from "../field-refs";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import type { Criterion } from "../types";

// ============================================================================
// ANAMNESIS CRITERIA (SQ Questionnaire)
// ============================================================================

/**
 * Criterion A: Pain in jaw, temple, in ear, or in front of ear (masticatory structure)
 * SQ1 = "yes" AND SQ3 ∈ ["intermittent", "continuous"]
 */
const painInMasticatoryStructure: Criterion = and(
  [
    field(sq("SQ1"), { equals: "yes" }),
    or([field(sq("SQ3"), { equals: "intermittent" }), field(sq("SQ3"), { equals: "continuous" })]),
  ],
  {
    id: "painInMasticatory",
    label: "Schmerz in einer mastikatorischen Struktur",
  }
);

/**
 * Criterion B: Pain modified by jaw movement, function, or parafunction
 * Any of SQ4_A, SQ4_B, SQ4_C, SQ4_D = "yes"
 */
const painModifiedByFunction: Criterion = any(
  [sq("SQ4_A"), sq("SQ4_B"), sq("SQ4_C"), sq("SQ4_D")],
  { equals: "yes" },
  {
    id: "painModified",
    label: "Schmerz durch Kieferbewegung, -funktion oder Parafunktion modifiziert",
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
 * Helper: Generate ANY criterion for all palpation sites in a region
 *
 * Uses template variables that will be resolved during evaluation:
 * - ${side} → "left" | "right"
 * - ${region} → "temporalis" | "masseter"
 *
 * This generates concrete refs at definition time for the region,
 * but uses ${side} template for the side.
 */
function createSiteFamiliarPainCriterion(): Criterion {
  // For temporalis: check all 3 temporalis sites
  const temporalisSites = SITES_BY_GROUP.temporalis;
  const temporalisRefs = temporalisSites.map((site) => `e9.\${side}.${site}.familiarPain`);

  // For masseter: check all 3 masseter sites
  const masseterSites = SITES_BY_GROUP.masseter;
  const masseterRefs = masseterSites.map((site) => `e9.\${side}.${site}.familiarPain`);

  // We need to check sites based on ${region}
  // Since we can't dynamically switch refs at definition time,
  // we use an OR that checks the appropriate sites based on region matching
  return or(
    [
      // If evaluating temporalis, these will be the relevant refs
      any(temporalisRefs, { equals: "yes" }, { id: "temporalisPalpationFamiliar" }),
      // If evaluating masseter, these will be the relevant refs
      any(masseterRefs, { equals: "yes" }, { id: "masseterPalpationFamiliar" }),
    ],
    { id: "palpationFamiliarPain", label: "Bekannter Schmerz bei Palpation" }
  );
}

/**
 * Criterion C: Confirmation of pain location in temporalis or masseter muscle
 * E1 pain location on ${side} includes ${region}
 */
const painLocationConfirmed: Criterion = field("e1.painLocation.${side}", {
  includes: "${region}",
});

/**
 * Criterion D: Familiar pain provoked by ONE of:
 * - Palpation of temporalis or masseter muscle (E9)
 * - Maximum unassisted or assisted opening (E4b, E4c)
 */
const familiarPainProvoked: Criterion = or(
  [
    // E4: Familiar pain during opening movements
    familiarPainDuringOpening("${side}", "${region}", {
      id: "openingFamiliarPain",
      label: "Bekannter Schmerz bei Mundöffnung",
    }),
    // E9: Familiar pain during palpation of any site in the muscle group
    createSiteFamiliarPainCriterion(),
  ],
  {
    id: "familiarPain",
    label: "Bekannter Schmerz bei Öffnung oder Palpation",
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
  regions: ["temporalis", "masseter"],
  criterion: and([painLocationConfirmed, familiarPainProvoked], {
    id: "myalgiaExam",
    label: "Myalgie-Untersuchungsbefund",
  }),
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
