/**
 * DC/TMD Criteria Module
 *
 * DSL for expressing diagnostic criteria with full traceability.
 *
 * @example
 * import {
 *   // Builders
 *   field, threshold, computed, and, or, not, any, all,
 *   // Types
 *   Criterion, CriterionResult, DiagnosisDefinition,
 *   // Evaluator
 *   evaluate,
 *   // Diagnoses
 *   MYALGIA, ALL_DIAGNOSES
 * } from "@cmdetect/dc-tmd/criteria";
 */

// Field references (simplified - all refs are strings with template resolution)
export { type TemplateContext, sq, resolveFieldRef, hasTemplateVars } from "./field-refs";

// Criterion types
export {
  type CriterionStatus,
  type ComparisonOperator,
  type NumericOperator,
  type FieldCondition,
  type CriterionMetadata,
  type FieldCriterion,
  type ThresholdCriterion,
  type ComputedCriterion,
  type MatchCriterion,
  type AndCriterion,
  type OrCriterion,
  type NotCriterion,
  type AnyCriterion,
  type AllCriterion,
  type Criterion,
  type BaseCriterionResult,
  type LeafCriterionResult,
  type ComputedCriterionResult,
  type CompositeCriterionResult,
  type QuantifierCriterionResult,
  type CriterionResult,
  isLeafResult,
  isComputedResult,
  isCompositeResult,
  isQuantifierResult,
  getCriterionId,
  getCriterionLabel,
} from "./types";

// Location types
export {
  type DiagnosisCategory,
  type LocationCriterion,
  type DiagnosisDefinition,
  type CriteriaLocationResult,
  type DiagnosisEvaluationResult,
  getPositiveLocations,
  hasAnyPositiveLocation,
  isLocationPositive,
  getLocationResult,
} from "./location";

// Builders
export {
  // Leaf builders
  field,
  threshold,
  computed,
  // Context builders
  match,
  // Composite builders
  and,
  or,
  not,
  // Quantifier builders
  any,
  all,
  // E9 helpers
  anySiteInGroup,
  getSiteRefs,
  getSiteRefsTemplate,
  // E4 helpers
  e4PainRef,
  familiarPainDuringOpening,
} from "./builders";

// Evaluator
export { evaluate } from "./evaluate";

// Diagnoses
export { MYALGIA, MYALGIA_ANAMNESIS, MYALGIA_EXAMINATION } from "./diagnoses/myalgia";
export {
  LOCAL_MYALGIA,
  LOCAL_MYALGIA_EXAMINATION,
  MYOFASCIAL_PAIN_WITH_SPREADING,
  MYOFASCIAL_SPREADING_EXAMINATION,
  MYOFASCIAL_PAIN_WITH_REFERRAL,
  MYOFASCIAL_REFERRAL_EXAMINATION,
} from "./diagnoses/myalgia-subtypes";

// All diagnoses (for iteration)
import { MYALGIA } from "./diagnoses/myalgia";
import {
  LOCAL_MYALGIA,
  MYOFASCIAL_PAIN_WITH_SPREADING,
  MYOFASCIAL_PAIN_WITH_REFERRAL,
} from "./diagnoses/myalgia-subtypes";
import type { DiagnosisDefinition } from "./location";

/**
 * All defined diagnoses
 *
 * Future diagnoses will be added here:
 * - Arthralgia
 * - Headache Attributed to TMD
 * - Disc Displacement variants
 * - Degenerative Joint Disease
 * - Subluxation
 */
export const ALL_DIAGNOSES: readonly DiagnosisDefinition[] = [
  MYALGIA,
  LOCAL_MYALGIA,
  MYOFASCIAL_PAIN_WITH_SPREADING,
  MYOFASCIAL_PAIN_WITH_REFERRAL,
];

/**
 * Get a diagnosis definition by ID
 */
export function getDiagnosisById(id: string): DiagnosisDefinition | undefined {
  return ALL_DIAGNOSES.find((d) => d.id === id);
}
