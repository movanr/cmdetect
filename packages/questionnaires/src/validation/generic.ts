/**
 * Generic validation schema for optional questionnaires
 *
 * Used for PHQ-4, GCPS, JFLS-8, JFLS-20, OBC, and pain drawing.
 * These questionnaires are optional, so:
 * - Empty answers are allowed
 * - All fields are optional
 * - Structure is validated when present, but missing data is OK
 */
import { z } from "zod";

/**
 * Generic answer value - accepts common questionnaire answer types
 */
const GenericAnswerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.unknown()),
  z.object({}).passthrough(),
]);

/**
 * Generic answers schema - accepts any record of answers
 * Used for optional questionnaires where all fields are optional
 */
export const GenericAnswersSchema = z.record(
  z.string(),
  GenericAnswerValueSchema
);

/**
 * Optional generic answers - the entire answers object may be missing
 */
export const OptionalAnswersSchema = GenericAnswersSchema.optional();

export type GenericAnswers = z.infer<typeof GenericAnswersSchema>;
