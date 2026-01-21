/**
 * Zod validation schemas for DC/TMD Symptom Questionnaire
 * Provides per-screen validation for wizard navigation
 */

import { z } from "zod";
import type { SQQuestion } from "@cmdetect/questionnaires";

/**
 * Creates a validation schema for a single screen/question
 * Used when user clicks "Next" to validate current answer
 */
export function createScreenSchema(question: SQQuestion): z.ZodTypeAny {
  switch (question.type) {
    case "single_choice":
      return z.object({
        [question.id]: z.string({ required_error: "Bitte wählen Sie eine Option" }),
      });

    case "matrix_row":
      return z.object({
        [question.id]: z.string({ required_error: "Bitte wählen Sie Ja oder Nein" }),
      });

    case "composite_number": {
      const errorMessage = "Bitte geben Sie Jahre oder Monate ein";
      return z.object({
        [question.id]: z
          .object({
            years: z.number().int().min(0).max(99).optional(),
            months: z.number().int().min(0).max(11).optional(),
          })
          .optional()
          .refine(
            (data) => data?.years != null || data?.months != null,
            { message: errorMessage }
          ),
      });
    }

    default: {
      // TypeScript exhaustive check
      const _exhaustive: never = question;
      throw new Error(`Unknown question type: ${_exhaustive}`);
    }
  }
}

/**
 * Validates the current screen's answer
 * Returns validation result with error message if invalid
 */
export function validateScreen(
  question: SQQuestion,
  value: unknown
): { success: true } | { success: false; error: string } {
  const schema = createScreenSchema(question);
  const result = schema.safeParse({ [question.id]: value });

  if (result.success) {
    return { success: true };
  }

  // Extract the first error message
  const firstError = result.error.errors[0];
  return {
    success: false,
    error: firstError?.message ?? "Ungültige Antwort",
  };
}
