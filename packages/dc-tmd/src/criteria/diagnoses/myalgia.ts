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
import { and } from "../builders";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import { MYALGIA_ANAMNESIS } from "./anamnesis-criteria";
import { MYALGIA_REGIONS, familiarPainProvoked, painLocationConfirmed } from "./examination-criteria";

// Re-export building blocks for backwards compatibility
export {
  painInMasticatoryStructure,
  painModifiedByFunction,
  MYALGIA_ANAMNESIS,
} from "./anamnesis-criteria";
export {
  MYALGIA_REGIONS,
  siteRefs,
  regionGated,
  forEachRegion,
  painLocationConfirmed,
  familiarPainProvoked,
} from "./examination-criteria";

// ============================================================================
// EXAMINATION (per-location)
// ============================================================================

/**
 * Complete examination criteria for Myalgia (per-location)
 *
 * Evaluated for each combination of:
 * - side: left, right
 * - region: temporalis, masseter, otherMast, nonMast
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
