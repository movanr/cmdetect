/**
 * Zod validation schema for PHQ-4
 * Simple: each question requires a string answer
 */

import { z } from "zod";

/**
 * Creates a validation schema for a single question
 */
export function createQuestionSchema(questionId: string): z.ZodObject<Record<string, z.ZodString>> {
  return z.object({
    [questionId]: z.string({ required_error: "Bitte wählen Sie eine Option" }),
  });
}

/**
 * Validates a single question's answer
 */
export function validateQuestion(
  questionId: string,
  value: unknown
): { success: true } | { success: false; error: string } {
  const schema = createQuestionSchema(questionId);
  const result = schema.safeParse({ [questionId]: value });

  if (result.success) {
    return { success: true };
  }

  const firstError = result.error.errors[0];
  return {
    success: false,
    error: firstError?.message ?? "Ungültige Antwort",
  };
}
