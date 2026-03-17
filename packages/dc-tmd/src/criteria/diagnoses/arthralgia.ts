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

import { and } from "../builders";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import { ARTHRALGIA_ANAMNESIS } from "./anamnesis-criteria";
import { familiarPainProvokedTmj, painLocationConfirmedTmj } from "./examination-criteria";

// Re-export for backwards compatibility
export { ARTHRALGIA_ANAMNESIS } from "./anamnesis-criteria";
export { painLocationConfirmedTmj, familiarPainProvokedTmj } from "./examination-criteria";

// ============================================================================
// EXAMINATION (per-location, region = tmj)
// ============================================================================

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
