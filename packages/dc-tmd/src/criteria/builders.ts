/**
 * Criterion Builders for DC/TMD Diagnostic Rules
 *
 * Factory functions for creating criterion objects with a fluent DSL.
 * These builders make it easy to define diagnostic criteria declaratively.
 */

import { SITES_BY_GROUP, type Region, type PainType } from "../ids/anatomy";
import type {
  Criterion,
  FieldCondition,
  FieldCriterion,
  ThresholdCriterion,
  ComputedCriterion,
  MatchCriterion,
  AndCriterion,
  OrCriterion,
  NotCriterion,
  AnyCriterion,
  AllCriterion,
  CriterionMetadata,
  NumericOperator,
} from "./types";

// ============================================================================
// LEAF CRITERION BUILDERS
// ============================================================================

/**
 * Creates a field criterion that compares a single field value
 *
 * @example
 * field("sq.SQ1", { equals: "yes" })
 * field("e1.painLocation.${side}", { includes: "${region}" })
 */
export function field(ref: string, condition: FieldCondition): FieldCriterion {
  return {
    type: "field",
    ref,
    condition,
  };
}

/**
 * Creates a threshold criterion that compares a numeric field to a threshold
 *
 * @example
 * threshold("e4.maxUnassisted.measurement", ">=", 40)
 * threshold("e2.verticalOverlap", "<", 5)
 */
export function threshold(ref: string, operator: NumericOperator, value: number): ThresholdCriterion {
  return {
    type: "threshold",
    ref,
    operator,
    value,
  };
}

/**
 * Creates a computed criterion that evaluates a function over multiple fields
 *
 * @example
 * computed(
 *   ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
 *   (v) => (v["e4.maxAssisted.measurement"] as number ?? 0) + (v["e2.verticalOverlap"] as number ?? 0),
 *   ">=",
 *   40
 * )
 */
export function computed(
  refs: string[],
  compute: (values: Record<string, unknown>) => number,
  operator: NumericOperator,
  value: number
): ComputedCriterion {
  return {
    type: "computed",
    refs,
    compute,
    operator,
    value,
  };
}

/**
 * Creates a match criterion that checks if a resolved template variable equals an expected value
 *
 * Used for region-gating: ensures criterion branches only activate
 * when the evaluation context matches the target region.
 *
 * @example
 * // Only activates when evaluating for temporalis
 * match("${region}", "temporalis")
 *
 * // Only activates for the left side
 * match("${side}", "left")
 */
export function match(ref: string, value: string, metadata?: CriterionMetadata): MatchCriterion {
  return {
    type: "match",
    ref,
    value,
    ...metadata,
  };
}

// ============================================================================
// COMPOSITE CRITERION BUILDERS
// ============================================================================

/**
 * Creates an AND criterion - all child criteria must be positive
 *
 * @example
 * and([
 *   field("sq.SQ1", { equals: "yes" }),
 *   field("sq.SQ3", { equals: "intermittent" }),
 * ])
 *
 * // With metadata for UI display
 * and(
 *   [field("sq.SQ1", { equals: "yes" }), field("sq.SQ3", { equals: "intermittent" })],
 *   { id: "painInMasticatory", label: "Schmerz in Kaumuskulatur" }
 * )
 */
export function and(criteria: Criterion[], metadata?: CriterionMetadata): AndCriterion {
  return {
    type: "and",
    criteria,
    ...metadata,
  };
}

/**
 * Creates an OR criterion - at least one child criterion must be positive
 *
 * @example
 * or([
 *   field("sq.SQ3", { equals: "intermittent" }),
 *   field("sq.SQ3", { equals: "continuous" }),
 * ])
 */
export function or(criteria: Criterion[], metadata?: CriterionMetadata): OrCriterion {
  return {
    type: "or",
    criteria,
    ...metadata,
  };
}

/**
 * Creates a NOT criterion - negates the child criterion
 *
 * @example
 * not(field("sq.SQ1", { equals: "no" }))
 */
export function not(criterion: Criterion, metadata?: CriterionMetadata): NotCriterion {
  return {
    type: "not",
    criterion,
    ...metadata,
  };
}

// ============================================================================
// QUANTIFIER CRITERION BUILDERS
// ============================================================================

/**
 * Creates an ANY criterion - at least one ref must satisfy the condition
 *
 * @example
 * any(["sq.SQ4_A", "sq.SQ4_B", "sq.SQ4_C", "sq.SQ4_D"], { equals: "yes" })
 *
 * // With metadata
 * any(
 *   ["sq.SQ4_A", "sq.SQ4_B", "sq.SQ4_C", "sq.SQ4_D"],
 *   { equals: "yes" },
 *   { id: "painModified", label: "Schmerz durch Kieferbewegung modifiziert" }
 * )
 *
 * // Require minimum count
 * any(refs, { equals: "yes" }, { minCount: 2 })
 */
export function any(
  refs: string[],
  condition: FieldCondition,
  options?: CriterionMetadata & { minCount?: number }
): AnyCriterion {
  const { minCount, ...metadata } = options ?? {};
  return {
    type: "any",
    refs,
    condition,
    minCount,
    ...metadata,
  };
}

/**
 * Creates an ALL criterion - all refs must satisfy the condition
 *
 * @example
 * all(["sq.SQ1", "sq.SQ2"], { equals: "yes" })
 */
export function all(refs: string[], condition: FieldCondition, metadata?: CriterionMetadata): AllCriterion {
  return {
    type: "all",
    refs,
    condition,
    ...metadata,
  };
}

// ============================================================================
// E9 PALPATION HELPERS
// ============================================================================

/**
 * Creates an ANY criterion for E9 palpation sites within a region
 *
 * This helper generates refs for all palpation sites in the given region
 * and checks if any has the specified pain question positive.
 *
 * @example
 * // Any temporalis site has familiar pain on left side
 * anySiteInGroup("temporalis", "left", "familiarPain", { equals: "yes" })
 *
 * // With template variables (resolved during evaluation)
 * anySiteInGroup("${region}", "${side}", "familiarPain", { equals: "yes" })
 */
export function anySiteInGroup(
  region: Region | "${region}",
  side: string,
  painQuestion: PainType,
  condition: FieldCondition,
  metadata?: CriterionMetadata
): AnyCriterion {
  // If region is a template variable, we generate refs with template vars
  // that will be resolved during evaluation
  if (region === "${region}") {
    // For templates, we can't expand sites at definition time
    // The evaluator will need to handle this specially
    return {
      type: "any",
      refs: [`e9.${side}.${region}.${painQuestion}`],
      condition,
      ...metadata,
    };
  }

  // For concrete regions, expand to all sites in the group
  const sites = SITES_BY_GROUP[region];
  const refs = sites.map((site) => `e9.${side}.${site}.${painQuestion}`);

  return {
    type: "any",
    refs,
    condition,
    ...metadata,
  };
}

/**
 * Creates refs for all palpation sites in a region
 *
 * Useful for building custom criteria over E9 sites.
 *
 * @example
 * const refs = getSiteRefs("temporalis", "left", "familiarPain")
 * // ["e9.left.temporalisPosterior.familiarPain", "e9.left.temporalisMiddle.familiarPain", ...]
 */
export function getSiteRefs(region: Region, side: string, painQuestion: PainType): string[] {
  const sites = SITES_BY_GROUP[region];
  return sites.map((site) => `e9.${side}.${site}.${painQuestion}`);
}

/**
 * Creates template refs for E9 palpation sites
 *
 * Uses ${side} and checks all sites in a given region.
 * The region can be a template variable ${region} or a concrete value.
 *
 * @example
 * getSiteRefsTemplate("temporalis", "familiarPain")
 * // ["e9.${side}.temporalisPosterior.familiarPain", ...]
 */
export function getSiteRefsTemplate(region: Region, painQuestion: PainType): string[] {
  const sites = SITES_BY_GROUP[region];
  return sites.map((site) => `e9.\${side}.${site}.${painQuestion}`);
}

// ============================================================================
// E4 OPENING HELPERS
// ============================================================================

/**
 * Creates a field ref for E4 opening pain question
 *
 * @example
 * e4PainRef("maxUnassisted", "left", "temporalis", "familiarPain")
 * // "e4.maxUnassisted.left.temporalis.familiarPain"
 *
 * // With templates
 * e4PainRef("maxUnassisted", "${side}", "${region}", "familiarPain")
 * // "e4.maxUnassisted.${side}.${region}.familiarPain"
 */
export function e4PainRef(
  openingType: "painFree" | "maxUnassisted" | "maxAssisted",
  side: string,
  region: string,
  painQuestion: PainType
): string {
  return `e4.${openingType}.${side}.${region}.${painQuestion}`;
}

/**
 * Creates OR criterion for familiar pain during any E4 opening movement
 *
 * @example
 * familiarPainDuringOpening("${side}", "${region}")
 */
export function familiarPainDuringOpening(
  side: string,
  region: string,
  metadata?: CriterionMetadata
): OrCriterion {
  return or(
    [
      field(e4PainRef("maxUnassisted", side, region, "familiarPain"), { equals: "yes" }),
      field(e4PainRef("maxAssisted", side, region, "familiarPain"), { equals: "yes" }),
    ],
    metadata
  );
}

// ============================================================================
// E5 LATERAL/PROTRUSIVE MOVEMENT HELPERS
// ============================================================================

/**
 * Creates a field ref for E5 movement pain question
 *
 * @example
 * e5PainRef("lateralRight", "left", "tmj", "familiarPain")
 * // "e5.lateralRight.left.tmj.familiarPain"
 */
export function e5PainRef(
  movementType: "lateralLeft" | "lateralRight" | "protrusive",
  side: string,
  region: string,
  painQuestion: PainType
): string {
  return `e5.${movementType}.${side}.${region}.${painQuestion}`;
}

/**
 * Creates OR criterion for familiar pain during any E5 movement
 * (lateralRight, lateralLeft, protrusive)
 */
export function familiarPainDuringMovement(
  side: string,
  region: string,
  metadata?: CriterionMetadata
): OrCriterion {
  return or(
    [
      field(e5PainRef("lateralRight", side, region, "familiarPain"), { equals: "yes" }),
      field(e5PainRef("lateralLeft", side, region, "familiarPain"), { equals: "yes" }),
      field(e5PainRef("protrusive", side, region, "familiarPain"), { equals: "yes" }),
    ],
    metadata
  );
}

// ============================================================================
// HEADACHE HELPERS (E4 + E5 familiarHeadache)
// ============================================================================

/**
 * Creates OR criterion for familiar headache during any E4 opening movement
 */
export function familiarHeadacheDuringOpening(
  side: string,
  region: string,
  metadata?: CriterionMetadata
): OrCriterion {
  return or(
    [
      field(e4PainRef("maxUnassisted", side, region, "familiarHeadache"), { equals: "yes" }),
      field(e4PainRef("maxAssisted", side, region, "familiarHeadache"), { equals: "yes" }),
    ],
    metadata
  );
}

/**
 * Creates OR criterion for familiar headache during any E5 movement
 */
export function familiarHeadacheDuringMovement(
  side: string,
  region: string,
  metadata?: CriterionMetadata
): OrCriterion {
  return or(
    [
      field(e5PainRef("lateralRight", side, region, "familiarHeadache"), { equals: "yes" }),
      field(e5PainRef("lateralLeft", side, region, "familiarHeadache"), { equals: "yes" }),
      field(e5PainRef("protrusive", side, region, "familiarHeadache"), { equals: "yes" }),
    ],
    metadata
  );
}
