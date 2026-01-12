import { z } from "zod";
import type { Question } from "../../model/question";

export function zodSchemaFromQuestions(questions: Question[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of questions) {
    switch (q.type) {
      case "choice":
        shape[q.instanceId] = z.enum(["yes", "no"]);
        break;
    }
  }

  return z.object(shape);
}
