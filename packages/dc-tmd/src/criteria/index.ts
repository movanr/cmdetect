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
  // E5 helpers
  e5PainRef,
  familiarPainDuringMovement,
  // Headache helpers
  familiarHeadacheDuringOpening,
  familiarHeadacheDuringMovement,
} from "./builders";

// Evaluator
export { evaluate } from "./evaluate";
export { evaluateDiagnosis, evaluateAllDiagnoses } from "./evaluate-diagnosis";

// Clinical context
export {
  type DiagnosticValidity,
  type DiagnosisClinicalContext,
  getDiagnosisClinicalContext,
} from "./clinical-context";

// Relevance analysis
export {
  type AnamnesisRelevanceResult,
  collectFieldRefs,
  getRelevantExaminationItems,
} from "./relevance";

// Diagnoses — Pain disorders
export {
  MYALGIA,
  MYALGIA_ANAMNESIS,
  MYALGIA_EXAMINATION,
  painInMasticatoryStructure,
  painModifiedByFunction,
  painLocationConfirmed,
  familiarPainProvoked,
} from "./diagnoses/myalgia";
export {
  LOCAL_MYALGIA,
  LOCAL_MYALGIA_EXAMINATION,
  MYOFASCIAL_PAIN_WITH_SPREADING,
  MYOFASCIAL_SPREADING_EXAMINATION,
  MYOFASCIAL_PAIN_WITH_REFERRAL,
  MYOFASCIAL_REFERRAL_EXAMINATION,
} from "./diagnoses/myalgia-subtypes";
export {
  ARTHRALGIA,
  ARTHRALGIA_ANAMNESIS,
  ARTHRALGIA_EXAMINATION,
  painLocationConfirmedTmj,
  familiarPainProvokedTmj,
} from "./diagnoses/arthralgia";
export {
  HEADACHE_ATTRIBUTED_TO_TMD,
  HEADACHE_ANAMNESIS,
  HEADACHE_EXAMINATION,
  headacheInTemporalRegion,
  headacheModifiedByFunction,
  headacheLocationConfirmed,
  familiarHeadacheProvoked,
} from "./diagnoses/headache";

// Diagnoses — Joint disorders
export {
  TMJ_NOISE_ANAMNESIS,
  DD_WITHOUT_REDUCTION_ANAMNESIS,
  DISC_DISPLACEMENT_WITH_REDUCTION,
  DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING,
} from "./diagnoses/disc-displacement";
export { DEGENERATIVE_JOINT_DISEASE } from "./diagnoses/degenerative-joint-disease";
export { SUBLUXATION, SUBLUXATION_ANAMNESIS } from "./diagnoses/subluxation";

// All diagnoses (for iteration)
import { MYALGIA } from "./diagnoses/myalgia";
import {
  LOCAL_MYALGIA,
  MYOFASCIAL_PAIN_WITH_SPREADING,
  MYOFASCIAL_PAIN_WITH_REFERRAL,
} from "./diagnoses/myalgia-subtypes";
import { ARTHRALGIA } from "./diagnoses/arthralgia";
import { HEADACHE_ATTRIBUTED_TO_TMD } from "./diagnoses/headache";
import {
  DISC_DISPLACEMENT_WITH_REDUCTION,
  DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING,
} from "./diagnoses/disc-displacement";
import { DEGENERATIVE_JOINT_DISEASE } from "./diagnoses/degenerative-joint-disease";
import { SUBLUXATION } from "./diagnoses/subluxation";
import type { DiagnosisDefinition } from "./location";

/**
 * All 12 DC/TMD diagnoses, ordered: pain disorders first, then joint disorders
 */
export const ALL_DIAGNOSES: readonly DiagnosisDefinition[] = [
  // Pain disorders
  MYALGIA,
  LOCAL_MYALGIA,
  MYOFASCIAL_PAIN_WITH_SPREADING,
  MYOFASCIAL_PAIN_WITH_REFERRAL,
  ARTHRALGIA,
  HEADACHE_ATTRIBUTED_TO_TMD,
  // Joint disorders
  DISC_DISPLACEMENT_WITH_REDUCTION,
  DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING,
  DEGENERATIVE_JOINT_DISEASE,
  SUBLUXATION,
];

/**
 * Get a diagnosis definition by ID
 */
export function getDiagnosisById(id: string): DiagnosisDefinition | undefined {
  return ALL_DIAGNOSES.find((d) => d.id === id);
}
