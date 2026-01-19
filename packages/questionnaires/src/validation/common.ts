/**
 * Common validation schemas used across questionnaires
 */
import { z } from "zod";

/**
 * Composite number answer (years/months) - at least one field must be present when object is provided
 */
export const CompositeNumberAnswerSchema = z
  .object({
    years: z.number().int().min(0).optional(),
    months: z.number().int().min(0).max(11).optional(),
  })
  .refine((data) => data.years !== undefined || data.months !== undefined, {
    message: "At least years or months required",
  });

/**
 * Yes/No answer type
 */
export const YesNoSchema = z.enum(["yes", "no"]);

/**
 * Common Likert scale (0-4)
 */
export const LikertSchema = z.enum(["0", "1", "2", "3", "4"]);

export type CompositeNumberAnswer = z.infer<typeof CompositeNumberAnswerSchema>;
export type YesNo = z.infer<typeof YesNoSchema>;
