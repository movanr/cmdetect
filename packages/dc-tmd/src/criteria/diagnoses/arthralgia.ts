/**
 * Arthralgia Diagnosis Definition
 *
 * DC/TMD diagnostic criteria for Arthralgia (TMJ pain).
 *
 * Criteria Summary:
 * A. Pain in masticatory region (SQ history) — same as myalgia
 * B. Pain modified by jaw movement/function (SQ history) — same as myalgia
 * C. Confirmation of pain location in TMJ (E1a)
 * D. Familiar pain in TMJ by palpation (E9), opening (E4), or movement (E5)
 *
 * Sensitivity: 0.89 / Specificity: 0.98
 */

import {
  and,
  any,
  familiarPainDuringMovement,
  familiarPainDuringOpening,
  field,
  getSiteRefsTemplate,
  or,
} from "../builders";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import type { Criterion } from "../types";
import { painInMasticatoryStructure, painModifiedByFunction } from "./myalgia";

// ============================================================================
// ANAMNESIS CRITERIA — same as myalgia (A+B)
// ============================================================================

export const ARTHRALGIA_ANAMNESIS: Criterion = and(
  [painInMasticatoryStructure, painModifiedByFunction],
  {
    id: "arthralgiaHistory",
    label: "Arthralgie-Anamnese",
  }
);

// ============================================================================
// EXAMINATION CRITERIA (per-location, region = tmj)
// ============================================================================

/**
 * Criterion C: Confirmation of pain location in TMJ
 * E1 pain location on ${side} includes "tmj"
 */
export const painLocationConfirmedTmj: Criterion = field("e1.painLocation.${side}", {
  includes: "tmj",
});

/**
 * Criterion D: Familiar pain in TMJ provoked by ONE of:
 * - E4 opening (maxUnassisted or maxAssisted)
 * - E5 lateral/protrusive movements
 * - E9 TMJ palpation (lateral pole or around lateral pole)
 */
export const familiarPainProvokedTmj: Criterion = or(
  [
    familiarPainDuringOpening("${side}", "tmj", {
      id: "openingFamiliarPainTmj",
      label: "Bekannter Schmerz bei Mundöffnung (KG)",
    }),
    familiarPainDuringMovement("${side}", "tmj", {
      id: "movementFamiliarPainTmj",
      label: "Bekannter Schmerz bei Lateral-/Protrusionsbewegung (KG)",
    }),
    any(getSiteRefsTemplate("tmj", "familiarPain"), { equals: "yes" }, {
      id: "tmjPalpationFamiliarPain",
      label: "Bekannter Schmerz bei Palpation (KG)",
    }),
  ],
  {
    id: "familiarPainTmj",
    label: "Bekannter Schmerz bei Öffnung, Bewegung oder Palpation (KG)",
  }
);

export const ARTHRALGIA_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: and([painLocationConfirmedTmj, familiarPainProvokedTmj], {
    id: "arthralgiaExam",
    label: "Arthralgie-Untersuchungsbefund",
  }),
};

// ============================================================================
// COMPLETE DIAGNOSIS DEFINITION
// ============================================================================

export const ARTHRALGIA: DiagnosisDefinition = {
  id: "arthralgia",
  name: "Arthralgia",
  nameDE: "Arthralgie",
  category: "pain",
  anamnesis: ARTHRALGIA_ANAMNESIS,
  examination: ARTHRALGIA_EXAMINATION,
};
