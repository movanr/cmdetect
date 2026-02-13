/**
 * Criteria Evaluator
 *
 * Evaluates a criterion against patient data, returning a result with
 * status (positive/negative/pending) and full traceability.
 *
 * @example
 * const criterion = field(sq("SQ1"), { equals: "yes" });
 * const data = { sq: { SQ1: "yes" } };
 * const result = evaluate(criterion, data);
 * // result.status === "positive"
 */

import type {
  Criterion,
  CriterionResult,
  CriterionStatus,
  FieldCriterion,
  ThresholdCriterion,
  ComputedCriterion,
  MatchCriterion,
  AndCriterion,
  OrCriterion,
  NotCriterion,
  AnyCriterion,
  AllCriterion,
  FieldCondition,
  LeafCriterionResult,
  ComputedCriterionResult,
  CompositeCriterionResult,
  QuantifierCriterionResult,
} from "./types";
import { resolveFieldRef, hasTemplateVars, type TemplateContext } from "./field-refs";

/**
 * Get value at dot-separated path from data object
 *
 * @example
 * getValueAtPath({ sq: { SQ1: "yes" } }, "sq.SQ1") // => "yes"
 * getValueAtPath({ e1: { painLocation: { left: ["temporalis"] } } }, "e1.painLocation.left") // => ["temporalis"]
 */
function getValueAtPath(data: unknown, path: string): unknown {
  const parts = path.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Evaluate a criterion against data
 *
 * @param criterion - The criterion to evaluate
 * @param data - Patient data object (questionnaire answers + examination findings)
 * @param context - Template context for resolving ${side}, ${region}, ${site} placeholders
 * @returns Result with status and traceability information
 */
export function evaluate(
  criterion: Criterion,
  data: unknown,
  context: TemplateContext = {}
): CriterionResult {
  const result = evaluateNode(criterion, data, context);

  // Apply pendingAs override for optional criteria (e.g., E8 defaults to positive when missing)
  if (
    result.status === "pending" &&
    "pendingAs" in criterion &&
    criterion.pendingAs
  ) {
    return { ...result, status: criterion.pendingAs };
  }

  return result;
}

/**
 * Internal dispatch — evaluates a single criterion node without pendingAs override
 */
function evaluateNode(
  criterion: Criterion,
  data: unknown,
  context: TemplateContext
): CriterionResult {
  switch (criterion.type) {
    case "field":
      return evaluateField(criterion, data, context);
    case "threshold":
      return evaluateThreshold(criterion, data, context);
    case "computed":
      return evaluateComputed(criterion, data, context);
    case "match":
      return evaluateMatch(criterion, context);
    case "and":
      return evaluateAnd(criterion, data, context);
    case "or":
      return evaluateOr(criterion, data, context);
    case "not":
      return evaluateNot(criterion, data, context);
    case "any":
      return evaluateAny(criterion, data, context);
    case "all":
      return evaluateAll(criterion, data, context);
  }
}

/**
 * Check if a value satisfies a condition
 */
function checkCondition(value: unknown, condition: FieldCondition, context: TemplateContext): boolean {
  if ("equals" in condition && condition.equals !== undefined) {
    return value === condition.equals;
  }
  if ("notEquals" in condition && condition.notEquals !== undefined) {
    return value !== condition.notEquals;
  }
  if ("includes" in condition && condition.includes !== undefined) {
    const target =
      typeof condition.includes === "string"
        ? resolveFieldRef(condition.includes, context)
        : condition.includes;
    return Array.isArray(value) && value.includes(target);
  }
  if ("notIncludes" in condition && condition.notIncludes !== undefined) {
    const target =
      typeof condition.notIncludes === "string"
        ? resolveFieldRef(condition.notIncludes, context)
        : condition.notIncludes;
    return !Array.isArray(value) || !value.includes(target);
  }
  // No condition specified, treat as always true
  return true;
}

/**
 * Evaluate a field criterion
 */
function evaluateField(
  criterion: FieldCriterion,
  data: unknown,
  context: TemplateContext
): LeafCriterionResult {
  const resolvedRef = resolveFieldRef(criterion.ref, context);
  const value = getValueAtPath(data, resolvedRef);

  // Missing value = pending (data not yet collected)
  if (value === undefined || value === null) {
    return {
      status: "pending",
      criterion,
      ref: resolvedRef,
      value,
    };
  }

  const isPositive = checkCondition(value, criterion.condition, context);

  return {
    status: isPositive ? "positive" : "negative",
    criterion,
    ref: resolvedRef,
    value,
  };
}

/**
 * Evaluate a match criterion
 *
 * Resolves the template expression and compares against expected value.
 * Returns pending if the template variable wasn't resolved.
 */
function evaluateMatch(
  criterion: MatchCriterion,
  context: TemplateContext
): LeafCriterionResult {
  const resolvedRef = resolveFieldRef(criterion.ref, context);

  // If template wasn't resolved, treat as pending
  if (hasTemplateVars(resolvedRef)) {
    return {
      status: "pending",
      criterion,
      ref: resolvedRef,
      value: resolvedRef,
    };
  }

  const isPositive = resolvedRef === criterion.value;

  return {
    status: isPositive ? "positive" : "negative",
    criterion,
    ref: resolvedRef,
    value: resolvedRef,
  };
}

/**
 * Evaluate a threshold criterion
 */
function evaluateThreshold(
  criterion: ThresholdCriterion,
  data: unknown,
  context: TemplateContext
): LeafCriterionResult {
  const resolvedRef = resolveFieldRef(criterion.ref, context);
  const value = getValueAtPath(data, resolvedRef);

  // Missing or non-numeric value = pending
  if (value === undefined || value === null || typeof value !== "number") {
    return {
      status: "pending",
      criterion,
      ref: resolvedRef,
      value,
    };
  }

  let isPositive = false;
  switch (criterion.operator) {
    case "<":
      isPositive = value < criterion.value;
      break;
    case ">":
      isPositive = value > criterion.value;
      break;
    case "<=":
      isPositive = value <= criterion.value;
      break;
    case ">=":
      isPositive = value >= criterion.value;
      break;
  }

  return {
    status: isPositive ? "positive" : "negative",
    criterion,
    ref: resolvedRef,
    value,
  };
}

/**
 * Evaluate a computed criterion
 */
function evaluateComputed(
  criterion: ComputedCriterion,
  data: unknown,
  context: TemplateContext
): ComputedCriterionResult {
  const values: Record<string, unknown> = {};
  let hasPending = false;

  for (const ref of criterion.refs) {
    const resolvedRef = resolveFieldRef(ref, context);
    const value = getValueAtPath(data, resolvedRef);
    if (value === undefined || value === null) {
      if (criterion.defaults?.[resolvedRef] !== undefined) {
        values[resolvedRef] = criterion.defaults[resolvedRef];
      } else {
        values[resolvedRef] = value;
        hasPending = true;
      }
    } else {
      values[resolvedRef] = value;
    }
  }

  if (hasPending) {
    return {
      status: "pending",
      criterion,
      values,
      computedValue: NaN,
    };
  }

  const computedValue = criterion.compute(values);

  let isPositive = false;
  switch (criterion.operator) {
    case "<":
      isPositive = computedValue < criterion.value;
      break;
    case ">":
      isPositive = computedValue > criterion.value;
      break;
    case "<=":
      isPositive = computedValue <= criterion.value;
      break;
    case ">=":
      isPositive = computedValue >= criterion.value;
      break;
  }

  return {
    status: isPositive ? "positive" : "negative",
    criterion,
    values,
    computedValue,
  };
}

/**
 * Evaluate an AND criterion
 *
 * - All children must be positive for result to be positive
 * - If any child is negative, result is negative
 * - If any child is pending and no negative, result is pending
 */
function evaluateAnd(
  criterion: AndCriterion,
  data: unknown,
  context: TemplateContext
): CompositeCriterionResult {
  const children = criterion.criteria.map((c) => evaluate(c, data, context));

  let status: CriterionStatus = "positive";
  for (const child of children) {
    if (child.status === "negative") {
      status = "negative";
      break;
    }
    if (child.status === "pending") {
      status = "pending";
    }
  }

  return {
    status,
    criterion,
    children,
  };
}

/**
 * Evaluate an OR criterion
 *
 * - At least one child must be positive for result to be positive
 * - If any child is positive, result is positive (short-circuit)
 * - If all children are negative, result is negative
 * - If some pending and no positive, result is pending
 */
function evaluateOr(
  criterion: OrCriterion,
  data: unknown,
  context: TemplateContext
): CompositeCriterionResult {
  const children = criterion.criteria.map((c) => evaluate(c, data, context));

  let status: CriterionStatus = "negative";
  let hasPending = false;

  for (const child of children) {
    if (child.status === "positive") {
      status = "positive";
      break;
    }
    if (child.status === "pending") {
      hasPending = true;
    }
  }

  if (status !== "positive" && hasPending) {
    status = "pending";
  }

  return {
    status,
    criterion,
    children,
  };
}

/**
 * Evaluate a NOT criterion
 *
 * - Negates the child status
 * - pending stays pending
 */
function evaluateNot(
  criterion: NotCriterion,
  data: unknown,
  context: TemplateContext
): CompositeCriterionResult {
  const childResult = evaluate(criterion.criterion, data, context);

  let status: CriterionStatus;
  if (childResult.status === "pending") {
    status = "pending";
  } else if (childResult.status === "positive") {
    status = "negative";
  } else {
    status = "positive";
  }

  return {
    status,
    criterion,
    children: [childResult],
  };
}

/**
 * Evaluate an ANY criterion
 *
 * - At least minCount (default 1) refs must satisfy condition
 * - If enough refs are positive, result is positive
 * - If impossible to reach minCount, result is negative
 * - Otherwise pending
 */
function evaluateAny(
  criterion: AnyCriterion,
  data: unknown,
  context: TemplateContext
): QuantifierCriterionResult {
  const values: Record<string, unknown> = {};
  const matchedRefs: string[] = [];
  const pendingRefs: string[] = [];
  const minCount = criterion.minCount ?? 1;

  for (const ref of criterion.refs) {
    const resolvedRef = resolveFieldRef(ref, context);
    const value = getValueAtPath(data, resolvedRef);
    values[resolvedRef] = value;

    if (value === undefined || value === null) {
      pendingRefs.push(resolvedRef);
    } else if (checkCondition(value, criterion.condition, context)) {
      matchedRefs.push(resolvedRef);
    }
  }

  let status: CriterionStatus;
  if (matchedRefs.length >= minCount) {
    // Enough matches - positive
    status = "positive";
  } else if (matchedRefs.length + pendingRefs.length < minCount) {
    // Even if all pending become matches, can't reach minCount - negative
    status = "negative";
  } else {
    // Could still reach minCount if pending data comes in
    status = "pending";
  }

  return {
    status,
    criterion,
    values,
    matchedRefs,
    pendingRefs,
  };
}

/**
 * Evaluate an ALL criterion
 *
 * - All refs must satisfy condition
 * - If any ref fails, result is negative
 * - If any ref is pending and none failed, result is pending
 * - If all pass, result is positive
 */
function evaluateAll(
  criterion: AllCriterion,
  data: unknown,
  context: TemplateContext
): QuantifierCriterionResult {
  const values: Record<string, unknown> = {};
  const matchedRefs: string[] = [];
  const pendingRefs: string[] = [];

  for (const ref of criterion.refs) {
    const resolvedRef = resolveFieldRef(ref, context);
    const value = getValueAtPath(data, resolvedRef);
    values[resolvedRef] = value;

    if (value === undefined || value === null) {
      pendingRefs.push(resolvedRef);
    } else if (checkCondition(value, criterion.condition, context)) {
      matchedRefs.push(resolvedRef);
    }
  }

  const failedCount = criterion.refs.length - matchedRefs.length - pendingRefs.length;

  let status: CriterionStatus;
  if (failedCount > 0) {
    // At least one ref failed - negative
    status = "negative";
  } else if (pendingRefs.length > 0) {
    // No failures but some pending - pending
    status = "pending";
  } else {
    // All matched - positive
    status = "positive";
  }

  return {
    status,
    criterion,
    values,
    matchedRefs,
    pendingRefs,
  };
}
