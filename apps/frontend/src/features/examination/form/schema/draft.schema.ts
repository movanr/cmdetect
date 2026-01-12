import { z } from "zod";
import type { Question } from "../../model/question";
import { flattenQuestions } from "./utils/flattenQuestions";

export function draftSchemaFromQuestions(questions: Question[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  const flat = flattenQuestions(questions);

  for (const q of flat) {
    switch (q.type) {
      case "numeric":
        shape[q.id] = z
          .number()
          .min(q.min ?? -Infinity)
          .max(q.max ?? Infinity)
          .nullable()
          .optional();
        break;

      case "choice":
        if (q.multiple) {
          // Multiple choice - array of strings
          shape[q.id] = z.array(z.string()).nullable().optional();
        } else {
          // Single choice - single string
          shape[q.id] = z.string().nullable().optional();
        }
        break;
    }
  }

  return z.object(shape);
}
