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
 * - Familiar pain specifically from palpation (criterion D, E9 or E10 — NOT E4 opening)
 * - 5-second palpation (standard mode) for spreading/referred assessment
 *
 * For supplemental regions (otherMast, nonMast) assessed via E10:
 * - Spreading pain is not applicable (sites don't collect spreading data)
 * - Only Local Myalgia and Myofascial Pain with Referral are possible subtypes
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

import { SITES_BY_GROUP } from "../../ids/anatomy";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import { MYALGIA_ANAMNESIS } from "./anamnesis-criteria";
import {
  MYALGIA_REGIONS,
  localMyalgiaExamCriterion,
  spreadingMyalgiaExamCriterion,
  referralMyalgiaExamCriterion,
} from "./examination-criteria";

// ============================================================================
// LOCAL MYALGIA
// ============================================================================

export const LOCAL_MYALGIA_EXAMINATION: LocationCriterion = {
  regions: MYALGIA_REGIONS,
  criterion: localMyalgiaExamCriterion,
  siteExpansion: {
    otherMast: SITES_BY_GROUP.otherMast,
    nonMast: SITES_BY_GROUP.nonMast,
  },
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

export const MYOFASCIAL_SPREADING_EXAMINATION: LocationCriterion = {
  regions: MYALGIA_REGIONS,
  criterion: spreadingMyalgiaExamCriterion,
  siteExpansion: {
    otherMast: SITES_BY_GROUP.otherMast,
    nonMast: SITES_BY_GROUP.nonMast,
  },
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

export const MYOFASCIAL_REFERRAL_EXAMINATION: LocationCriterion = {
  regions: MYALGIA_REGIONS,
  criterion: referralMyalgiaExamCriterion,
  siteExpansion: {
    otherMast: SITES_BY_GROUP.otherMast,
    nonMast: SITES_BY_GROUP.nonMast,
  },
};

/**
 * Sensitivity: 0.86 / Specificity: 0.98
 */
export const MYOFASCIAL_PAIN_WITH_REFERRAL: DiagnosisDefinition = {
  id: "myofascialPainWithReferral",
  name: "Myofascial Pain with Referral",
  nameDE: "Myofaszialer Schmerz mit Übertragung",
  category: "pain",
  anamnesis: MYALGIA_ANAMNESIS,
  examination: MYOFASCIAL_REFERRAL_EXAMINATION,
};
