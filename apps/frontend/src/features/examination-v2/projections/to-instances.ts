import type { ModelNode } from "../model/nodes";

export type QuestionInstance = {
  path: string;
  labelKey?: string;
  renderType: string;
  context: Record<string, string>;
};

export function instancesFromModel(
  rootKey: string,
  model: ModelNode,
  parentPath: string[] = [],
  context: Record<string, string> = {}
): QuestionInstance[] {
  const currentPath = [...parentPath, rootKey];

  if (model.__nodeType === "question") {
    return [
      {
        path: currentPath.join("."),
        labelKey: model.__labelKey,
        renderType: model.__primitive.renderType,
        context,
      },
    ];
  }

  const instances: QuestionInstance[] = [];
  for (const [key, child] of Object.entries(model.__children)) {
    const enrichedContext = enrichContext(context, key);
    instances.push(
      ...instancesFromModel(key, child, currentPath, enrichedContext)
    );
  }
  return instances;
}

// E4-specific context enrichment (refactor when adding E9)
function enrichContext(
  ctx: Record<string, string>,
  key: string
): Record<string, string> {
  if (key === "left" || key === "right") return { ...ctx, side: key };
  if (["temporalis", "masseter", "tmj", "otherMast", "nonMast"].includes(key)) {
    return { ...ctx, region: key };
  }
  if (["pain", "familiarPain", "familiarHeadache"].includes(key)) {
    return { ...ctx, painType: key };
  }
  return ctx;
}

// Generate default values from model
export function defaultsFromModel(model: ModelNode): unknown {
  if (model.__nodeType === "question") {
    return model.__primitive.defaultValue;
  }
  return Object.fromEntries(
    Object.entries(model.__children).map(([k, v]) => [k, defaultsFromModel(v)])
  );
}
