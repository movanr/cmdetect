/**
 * Zod validation schemas for DC/TMD Symptom Questionnaire
 * Provides per-screen validation for wizard navigation
 */

import { z } from "zod";
import type { SQQuestion } from "../model/question";

/**
 * Schema for composite number fields (years + months)
 * At least one of years or months must be provided
 * Note: values are already numbers from parseInt in the component, no coercion needed
 */
const compositeNumberSchema = z
  .object({
    years: z.number().int().min(0).max(99).optional(),
    months: z.number().int().min(0).max(11).optional(),
  })
  .refine((data) => data.years != null || data.months != null, {
    message: "Please enter years or months",
  });

/**
 * Creates a validation schema for a single screen/question
 * Used when user clicks "Next" to validate current answer
 */
export function createScreenSchema(question: SQQuestion): z.ZodTypeAny {
  switch (question.type) {
    case "single_choice":
      return z.object({
        [question.id]: z.string({ required_error: "Please select an option" }),
      });

    case "matrix_row":
      return z.object({
        [question.id]: z.string({ required_error: "Please select Yes or No" }),
      });

    case "composite_number":
      return z.object({
        [question.id]: compositeNumberSchema,
      });

    default:
      // TypeScript exhaustive check
      const _exhaustive: never = question;
      throw new Error(`Unknown question type: ${_exhaustive}`);
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
    error: firstError?.message ?? "Invalid answer",
  };
}
