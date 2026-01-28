/**
 * Field Reference Types for DC/TMD Criteria
 *
 * Defines data paths for SQ questionnaire answers and examination fields.
 * Template variables (${side}, ${region}, ${site}) are resolved during evaluation.
 */

import type { SQQuestionId } from "@cmdetect/questionnaires";
import type { PainType, PalpationSite, Region, Side } from "../ids/anatomy";
import type {
  E1Field,
  E2Field,
  E3Field,
  JointSound,
  MeasurementField,
  MovementType,
  OpeningType,
} from "../ids/examination";

/**
 * SQ Questionnaire field references
 * Format: sq.{questionId}
 */
export type SQFieldRef = `sq.${SQQuestionId}`;

/**
 * Creates an SQ field reference from a question ID
 *
 * @example
 * sq("SQ1") // => "sq.SQ1"
 * field(sq("SQ1"), { equals: "yes" })
 */
export function sq<T extends SQQuestionId>(questionId: T): `sq.${T}` {
  return `sq.${questionId}`;
}

/**
 * E1 Pain Location field references
 * Format: e1.painLocation.{side}
 * Value: Region[] - array of regions where pain is reported
 */
export type E1FieldRef = `e1.${E1Field}.${Side}`;

/**
 * E2 Vertical Overlap field references
 * Format: e2.{field}
 */
export type E2FieldRef = `e2.${E2Field}`;

/**
 * E3 Opening Pattern field references
 * Format: e3.{field}
 */
export type E3FieldRef = `e3.${E3Field}`;

/**
 * E4 Opening Range field references
 * Format: e4.{openingType}.{field} for measurements
 * Format: e4.{openingType}.{side}.{region}.{painType} for pain questions
 */
export type E4MeasurementRef = `e4.${OpeningType}.${MeasurementField}`;
export type E4PainRef = `e4.${OpeningType}.${Side}.${Region}.${PainType}`;
export type E4FieldRef = E4MeasurementRef | E4PainRef;

/**
 * E5 Lateral/Protrusive Movement field references
 * Format: e5.{movementType}.{field}
 * Format: e5.{movementType}.{side}.{region}.{painType}
 */
export type E5MeasurementRef = `e5.${MovementType}.${MeasurementField}`;
export type E5PainRef = `e5.${MovementType}.${Side}.${Region}.${PainType}`;
export type E5FieldRef = E5MeasurementRef | E5PainRef;

/**
 * E6-E8 Joint Sound field references (joint sounds during opening/closing)
 */
export type E6FieldRef = `e6.${Side}.${JointSound}`;
export type E7FieldRef = `e7.${Side}.${JointSound}`;
export type E8FieldRef = `e8.${Side}.${JointSound}`;

/**
 * E9 Palpation field references
 * Format: e9.{side}.{site}.{painType}
 */
export type E9FieldRef = `e9.${Side}.${PalpationSite}.${PainType}`;

/**
 * E10 Supplemental examination field references
 */
export type E10FieldRef = `e10.${string}`;

/**
 * All examination field references
 */
export type ExamFieldRef =
  | E1FieldRef
  | E2FieldRef
  | E3FieldRef
  | E4FieldRef
  | E5FieldRef
  | E6FieldRef
  | E7FieldRef
  | E8FieldRef
  | E9FieldRef
  | E10FieldRef;

/**
 * All field references (SQ + Examination)
 */
export type FieldRef = SQFieldRef | ExamFieldRef;

/**
 * Template field references with placeholders
 * ${side} - resolved to Side ("left" | "right")
 * ${region} - resolved to Region
 * ${site} - resolved to PalpationSite
 */
export type TemplateVar = "${side}" | "${region}" | "${site}";

/**
 * Template context for resolving placeholders
 */
export interface TemplateContext {
  side?: Side;
  region?: Region;
  site?: PalpationSite;
}

/**
 * Resolves template variables in a field reference
 */
export function resolveFieldRef(ref: string, context: TemplateContext): string {
  let resolved = ref;
  if (context.side) {
    resolved = resolved.replace(/\$\{side\}/g, context.side);
  }
  if (context.region) {
    resolved = resolved.replace(/\$\{region\}/g, context.region);
  }
  if (context.site) {
    resolved = resolved.replace(/\$\{site\}/g, context.site);
  }
  return resolved;
}

/**
 * Checks if a field reference contains template variables
 */
export function hasTemplateVars(ref: string): boolean {
  return ref.includes("${");
}
