import { z } from "zod";
import type { ModelNode, InferModelType } from "../model/nodes";

export function schemaFromModel<T extends ModelNode>(
  model: T
): z.ZodType<InferModelType<T>> {
  if (model.__nodeType === "question") {
    return model.__primitive.schema as unknown as z.ZodType<InferModelType<T>>;
  }

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [key, child] of Object.entries(model.__children)) {
    shape[key] = schemaFromModel(child);
  }
  return z.object(shape) as unknown as z.ZodType<InferModelType<T>>;
}

export function schemaWithRoot<K extends string, T extends ModelNode>(
  rootKey: K,
  model: T
) {
  return z.object({
    [rootKey]: schemaFromModel(model),
  }) as unknown as z.ZodObject<{
    [P in K]: z.ZodType<InferModelType<T>>;
  }>;
}
