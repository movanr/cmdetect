import { z } from "zod";
import type { Question } from "../../model/question";

/**
 * Generates a Zod schema from an array of Question definitions.
 * All fields are optional to support partial form state during entry.
 *
 * For submission validation with required fields, use zodSubmitSchemaFromQuestions.
 */
export function zodSchemaFromQuestions(
  questions: Question[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of questions) {
    switch (q.type) {
      case "choice": {
        // Extract values from answer options
        const values = q.answerOptions.map((opt) => String(opt.value));
        if (values.length === 0) {
          // Fallback for empty options (shouldn't happen)
          shape[q.instanceId] = z.string().optional();
        } else if (q.multiple) {
          // Multiple choice: array of strings
          shape[q.instanceId] = z.array(z.string()).optional();
        } else {
          // Single choice: enum of values
          shape[q.instanceId] = z
            .enum(values as [string, ...string[]])
            .optional();
        }
        break;
      }

      case "numeric": {
        let numericSchema = z.number();
        if (q.min !== undefined) {
          numericSchema = numericSchema.min(q.min);
        }
        if (q.max !== undefined) {
          numericSchema = numericSchema.max(q.max);
        }
        // Nullable to allow clearing the field
        shape[q.instanceId] = numericSchema.nullable().optional();
        break;
      }

      case "boolean": {
        shape[q.instanceId] = z.boolean().optional();
        break;
      }
    }
  }

  return z.object(shape);
}

/**
 * Generates a Zod schema for form submission where certain fields may be required.
 * Uses superRefine for conditional validation based on enableWhen conditions.
 */
export function zodSubmitSchemaFromQuestions(
  questions: Question[],
  isQuestionEnabled: (
    instanceId: string,
    answers: Record<string, unknown>
  ) => boolean
): z.ZodEffects<z.ZodObject<Record<string, z.ZodTypeAny>>> {
  const baseSchema = zodSchemaFromQuestions(questions);

  return baseSchema.superRefine((data, ctx) => {
    for (const q of questions) {
      // Skip validation for disabled questions
      if (!isQuestionEnabled(q.instanceId, data)) {
        continue;
      }

      const value = data[q.instanceId];

      // Check if required field is missing
      if (value === undefined || value === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [q.instanceId],
          message: "Dieses Feld ist erforderlich",
        });
      }
    }
  });
}
