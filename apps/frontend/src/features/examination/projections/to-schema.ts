import { z } from "zod";
import type { ModelNode, InferModelType } from "../model/nodes";

export function schemaFromModel<T extends ModelNode>(
  model: T
): z.ZodType<InferModelType<T>> {
  if (model.__nodeType === "question") {
    // Single cast - TypeScript knows model.__primitive.schema is z.ZodType<something>
    return model.__primitive.schema as z.ZodType<InferModelType<T>>;
  }

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, child] of Object.entries(model.__children)) {
    shape[key] = schemaFromModel(child);
  }
  // Cast via unknown needed due to dynamic object construction
  return z.object(shape) as unknown as z.ZodType<InferModelType<T>>;
}

export function schemaWithRoot<K extends string, T extends ModelNode>(
  rootKey: K,
  model: T
) {
  // Cast via unknown needed due to computed property key limitation
  return z.object({
    [rootKey]: schemaFromModel(model),
  }) as unknown as z.ZodObject<{
    [P in K]: z.ZodType<InferModelType<T>>;
  }>;
}
