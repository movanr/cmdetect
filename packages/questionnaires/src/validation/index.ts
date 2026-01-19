/**
 * Questionnaire validation schemas
 *
 * Provides Zod schemas for validating questionnaire response data:
 * - SQ: Required questionnaire with strict validation
 * - Others (PHQ-4, GCPS, JFLS, OBC): Optional questionnaires with flexible validation
 */
import { z } from "zod";
import { QUESTIONNAIRE_ID, type QuestionnaireId } from "../ids";
import { SQAnswersSchema, isSQScreeningNegative } from "./sq";
import { GenericAnswersSchema } from "./generic";

// Re-export schemas and non-conflicting types
// Note: SQAnswers and CompositeNumberAnswer are already exported from ../types
export {
  CompositeNumberAnswerSchema,
  YesNoSchema,
  LikertSchema,
  type YesNo,
} from "./common";

export {
  SQAnswersSchema,
  SQPainFrequencySchema,
  isSQScreeningNegative,
  type SQPainFrequency,
} from "./sq";

export {
  GenericAnswersSchema,
  OptionalAnswersSchema,
  type GenericAnswers,
} from "./generic";

/**
 * Schema registry - maps questionnaire IDs to their answer schemas
 *
 * SQ uses strict validation, others use generic (flexible) validation
 */
export const questionnaireSchemas: Record<QuestionnaireId, z.ZodTypeAny> = {
  [QUESTIONNAIRE_ID.SQ]: SQAnswersSchema,
  [QUESTIONNAIRE_ID.PAIN_DRAWING]: GenericAnswersSchema,
  [QUESTIONNAIRE_ID.PHQ4]: GenericAnswersSchema,
  [QUESTIONNAIRE_ID.GCPS_1M]: GenericAnswersSchema,
  [QUESTIONNAIRE_ID.JFLS8]: GenericAnswersSchema,
  [QUESTIONNAIRE_ID.JFLS20]: GenericAnswersSchema,
  [QUESTIONNAIRE_ID.OBC]: GenericAnswersSchema,
};

/**
 * Get the answers schema for a questionnaire ID
 * Falls back to generic schema for unknown IDs
 */
export function getAnswersSchema(questionnaireId: string): z.ZodTypeAny {
  return (
    questionnaireSchemas[questionnaireId as QuestionnaireId] ??
    GenericAnswersSchema
  );
}

/**
 * Response data wrapper - validates the stored response structure
 */
export const ResponseDataSchema = z.object({
  questionnaire_id: z.string(),
  questionnaire_version: z.string(),
  answers: z.record(z.string(), z.unknown()),
  submitted_at: z.string().optional(),
  _meta: z
    .object({
      reviewed_at: z.string().optional(),
      reviewed_by: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export type ResponseData = z.infer<typeof ResponseDataSchema>;

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a questionnaire response
 * Returns validation result with error message if invalid
 */
export function validateQuestionnaireResponse(
  questionnaireId: string,
  answers: unknown
): ValidationResult {
  const schema = getAnswersSchema(questionnaireId);
  const result = schema.safeParse(answers);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message ?? "Invalid answers",
    };
  }

  return { valid: true };
}

/**
 * Check if SQ answers indicate screening is complete
 * Returns completion status and whether screening is negative
 */
export function checkSQCompletion(answers: unknown): {
  complete: boolean;
  screeningNegative: boolean;
} {
  const result = SQAnswersSchema.safeParse(answers);
  if (!result.success) {
    return { complete: false, screeningNegative: false };
  }
  return {
    complete: true,
    screeningNegative: isSQScreeningNegative(result.data),
  };
}
