/**
 * Subluxation Diagnosis Definition
 *
 * DC/TMD diagnostic criteria for Subluxation.
 *
 * Criteria Summary:
 * A. Jaw locking or catching in wide-open position (SQ13)
 * B. Inability to close mouth without special maneuver (SQ14)
 * C. Examination: if clinically observed, redirect to close required (E8, optional)
 *
 * Since the examination is optional per DC/TMD protocol, the exam criterion
 * is trivially positive (match on region "tmj").
 *
 * Sensitivity: 0.98 / Specificity: 1.0
 */

import { and, field, match } from "../builders";
import { sq } from "../field-refs";
import type { DiagnosisDefinition, LocationCriterion } from "../location";
import type { Criterion } from "../types";

// ============================================================================
// ANAMNESIS CRITERIA
// ============================================================================

export const SUBLUXATION_ANAMNESIS: Criterion = and(
  [
    field(sq("SQ13"), { equals: "yes" }),
    field(sq("SQ14"), { equals: "yes" }),
  ],
  {
    id: "subluxationHistory",
    label: "Subluxation-Anamnese",
  }
);

// ============================================================================
// EXAMINATION CRITERIA
// ============================================================================

/**
 * Examination is optional per DC/TMD: "if disorder occurs clinically, redirect
 * to close mouth required (E8 optional)". Since anamnesis is sufficient and
 * exam is optional, we use a trivial match on the TMJ region.
 */
const SUBLUXATION_EXAMINATION: LocationCriterion = {
  regions: ["tmj"],
  criterion: match("${region}", "tmj", {
    id: "subluxationExam",
    label: "Subluxation-Untersuchungsbefund (optional)",
  }),
};

// ============================================================================
// COMPLETE DIAGNOSIS DEFINITION
// ============================================================================

export const SUBLUXATION: DiagnosisDefinition = {
  id: "subluxation",
  name: "Subluxation",
  nameDE: "Subluxation",
  category: "joint",
  anamnesis: SUBLUXATION_ANAMNESIS,
  examination: SUBLUXATION_EXAMINATION,
};
