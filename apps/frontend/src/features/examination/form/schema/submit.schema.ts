import { z } from "zod";
import type { Question } from "../../model/question";
import { flattenQuestions } from "./utils/flattenQuestions";

export function submitSchemaFromQuestions(questions: Question[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  const flat = flattenQuestions(questions);

  for (const q of flat) {
    switch (q.type) {
      case "numeric":
        shape[q.id] = z
          .number({
            message: "This field is required",
          })
          .min(
            q.min ?? -Infinity,
            q.min !== undefined ? `Value must be at least ${q.min}` : undefined
          )
          .max(
            q.max ?? Infinity,
            q.max !== undefined ? `Value must be at most ${q.max}` : undefined
          );
        break;

      case "choice":
        if (q.multiple) {
          // Multiple choice - array of strings
          shape[q.id] = z.array(z.string()).min(1, "Please select at least one option");
        } else {
          // Single choice - single string
          shape[q.id] = z.string({ message: "Please select an option" });
        }
        break;
    }
  }

  return z.object(shape);
}
