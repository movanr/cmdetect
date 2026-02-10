/**
 * Criterion Types for DC/TMD Diagnostic Rules
 *
 * A DSL (Domain Specific Language) for expressing diagnostic criteria.
 * Criteria form a tree structure that can be evaluated and traced.
 */

import type { FieldRef } from "./field-refs";

/**
 * Status of criterion evaluation
 */
export type CriterionStatus = "positive" | "negative" | "pending";

/**
 * Comparison operators for field conditions
 */
export type ComparisonOperator = "equals" | "notEquals" | "includes" | "notIncludes";

/**
 * Numeric operators for threshold conditions
 */
export type NumericOperator = "<" | ">" | "<=" | ">=";

/**
 * Condition for comparing a field value
 */
export interface FieldCondition {
  /** Check if value equals this */
  equals?: unknown;
  /** Check if value does not equal this */
  notEquals?: unknown;
  /** Check if array value includes this (for multi-select fields) */
  includes?: unknown;
  /** Check if array value does not include this */
  notIncludes?: unknown;
}

/**
 * Optional metadata for composite criteria (for UI display and referencing)
 */
export interface CriterionMetadata {
  /** Unique identifier for referencing this criterion */
  id?: string;
  /** Human-readable label for UI display */
  label?: string;
  /** Override status when evaluation result is "pending" (for optional criteria that default to a known status) */
  pendingAs?: CriterionStatus;
}

// ============================================================================
// LEAF CRITERIA (reference data directly)
// ============================================================================

/**
 * Field criterion - compares a single field value
 */
export interface FieldCriterion {
  type: "field";
  /** Field reference (may contain template variables) */
  ref: string;
  /** Condition to evaluate */
  condition: FieldCondition;
}

/**
 * Threshold criterion - compares a numeric field to a threshold
 */
export interface ThresholdCriterion {
  type: "threshold";
  /** Field reference for numeric value */
  ref: string;
  /** Comparison operator */
  operator: NumericOperator;
  /** Threshold value */
  value: number;
}

/**
 * Computed criterion - evaluates a function over multiple fields
 */
export interface ComputedCriterion {
  type: "computed";
  /** Field references to gather values from */
  refs: string[];
  /** Function to compute a value from gathered fields */
  compute: (values: Record<string, unknown>) => number;
  /** Comparison operator */
  operator: NumericOperator;
  /** Threshold value to compare against */
  value: number;
}

// ============================================================================
// COMPOSITE CRITERIA (combine other criteria)
// ============================================================================

/**
 * AND criterion - all child criteria must be positive
 */
export interface AndCriterion extends CriterionMetadata {
  type: "and";
  /** Child criteria (all must be positive) */
  criteria: Criterion[];
}

/**
 * OR criterion - at least one child criterion must be positive
 */
export interface OrCriterion extends CriterionMetadata {
  type: "or";
  /** Child criteria (at least one must be positive) */
  criteria: Criterion[];
}

/**
 * NOT criterion - negates the child criterion
 */
export interface NotCriterion extends CriterionMetadata {
  type: "not";
  /** Child criterion to negate */
  criterion: Criterion;
}

// ============================================================================
// QUANTIFIER CRITERIA (evaluate condition over multiple refs)
// ============================================================================

/**
 * ANY criterion - at least one ref must satisfy the condition
 */
export interface AnyCriterion extends CriterionMetadata {
  type: "any";
  /** Field references to check */
  refs: string[];
  /** Condition each ref is checked against */
  condition: FieldCondition;
  /** Minimum number of refs that must match (default: 1) */
  minCount?: number;
}

/**
 * ALL criterion - all refs must satisfy the condition
 */
export interface AllCriterion extends CriterionMetadata {
  type: "all";
  /** Field references to check */
  refs: string[];
  /** Condition each ref is checked against */
  condition: FieldCondition;
}

// ============================================================================
// CONTEXT CRITERIA (check evaluation context, not data)
// ============================================================================

/**
 * Match criterion - checks if a resolved template variable matches an expected value
 *
 * Used for region-gating: ensures criterion branches only activate
 * when the evaluation context matches the target region.
 *
 * @example
 * // Only activates when evaluating for temporalis
 * match("${region}", "temporalis")
 */
export interface MatchCriterion extends CriterionMetadata {
  type: "match";
  /** Template expression to resolve (e.g., "${region}") */
  ref: string;
  /** Expected resolved value */
  value: string;
}

// ============================================================================
// UNION TYPE
// ============================================================================

/**
 * All criterion types
 */
export type Criterion =
  // Leaf criteria
  | FieldCriterion
  | ThresholdCriterion
  | ComputedCriterion
  // Composite criteria
  | AndCriterion
  | OrCriterion
  | NotCriterion
  // Quantifier criteria
  | AnyCriterion
  | AllCriterion
  // Context criteria
  | MatchCriterion;

// ============================================================================
// RESULT TYPES (mirror criterion tree structure)
// ============================================================================

/**
 * Base result fields present on all criterion results
 */
export interface BaseCriterionResult {
  /** Evaluation status */
  status: CriterionStatus;
  /** The criterion that was evaluated */
  criterion: Criterion;
}

/**
 * Result for field/threshold criteria (leaf nodes)
 */
export interface LeafCriterionResult extends BaseCriterionResult {
  /** The resolved field reference */
  ref: string;
  /** The actual value found */
  value: unknown;
}

/**
 * Result for computed criteria
 */
export interface ComputedCriterionResult extends BaseCriterionResult {
  /** Map of ref -> value for all input fields */
  values: Record<string, unknown>;
  /** The computed result value */
  computedValue: number;
}

/**
 * Result for composite criteria (and/or/not)
 */
export interface CompositeCriterionResult extends BaseCriterionResult {
  /** Results for child criteria */
  children: CriterionResult[];
}

/**
 * Result for quantifier criteria (any/all)
 */
export interface QuantifierCriterionResult extends BaseCriterionResult {
  /** Map of ref -> value for all checked fields */
  values: Record<string, unknown>;
  /** Refs that matched the condition */
  matchedRefs: string[];
  /** Refs that are pending (no value yet) */
  pendingRefs: string[];
}

/**
 * Union type for all criterion results
 */
export type CriterionResult =
  | LeafCriterionResult
  | ComputedCriterionResult
  | CompositeCriterionResult
  | QuantifierCriterionResult;

/**
 * Type guard: checks if result is a leaf criterion result
 */
export function isLeafResult(result: CriterionResult): result is LeafCriterionResult {
  return (
    result.criterion.type === "field" ||
    result.criterion.type === "threshold" ||
    result.criterion.type === "match"
  );
}

/**
 * Type guard: checks if result is a computed criterion result
 */
export function isComputedResult(result: CriterionResult): result is ComputedCriterionResult {
  return result.criterion.type === "computed";
}

/**
 * Type guard: checks if result is a composite criterion result
 */
export function isCompositeResult(result: CriterionResult): result is CompositeCriterionResult {
  return (
    result.criterion.type === "and" ||
    result.criterion.type === "or" ||
    result.criterion.type === "not"
  );
}

/**
 * Type guard: checks if result is a quantifier criterion result
 */
export function isQuantifierResult(result: CriterionResult): result is QuantifierCriterionResult {
  return result.criterion.type === "any" || result.criterion.type === "all";
}

/**
 * Extracts the id from a criterion (if present)
 */
export function getCriterionId(criterion: Criterion): string | undefined {
  if ("id" in criterion) {
    return criterion.id;
  }
  return undefined;
}

/**
 * Extracts the label from a criterion (if present)
 */
export function getCriterionLabel(criterion: Criterion): string | undefined {
  if ("label" in criterion) {
    return criterion.label;
  }
  return undefined;
}
