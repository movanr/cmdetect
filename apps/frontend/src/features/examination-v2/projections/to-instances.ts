import type { ModelNode } from "../model/nodes";
import type { EnableWhen } from "../model/conditions";

export type QuestionInstance = {
  path: string;
  labelKey?: string;
  renderType: string;
  context: Record<string, string>;
  config: Record<string, unknown>;
  enableWhen?: EnableWhen;
};

export function instancesFromModel(
  rootKey: string,
  model: ModelNode,
  parentPath: string[] = [],
  context: Record<string, string> = {}
): QuestionInstance[] {
  const currentPath = [...parentPath, rootKey];

  if (model.__nodeType === "question") {
    const config = model.__primitive.config as { enableWhen?: EnableWhen };
    return [
      {
        path: currentPath.join("."),
        labelKey: model.__labelKey,
        renderType: model.__primitive.renderType,
        context,
        config: model.__primitive.config,
        enableWhen: config.enableWhen,
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

// Step definition: array of paths or wildcard string
export type StepDefinition = readonly string[] | string;

/**
 * Get QuestionInstance[] for a specific step.
 * Same filtering logic as getStepPaths but returns full instances.
 */
export function getStepInstances<TSteps extends Record<string, StepDefinition>>(
  instances: QuestionInstance[],
  steps: TSteps,
  stepId: keyof TSteps,
  rootKey: string
): QuestionInstance[] {
  const stepDef = steps[stepId];

  if (typeof stepDef === "string" && stepDef.endsWith(".*")) {
    // Wildcard: filter by prefix and context.side (interview questions)
    const prefix = `${rootKey}.${stepDef.slice(0, -2)}`;
    return instances.filter((i) => i.path.startsWith(prefix) && i.context.side);
  }

  // Explicit path array
  const pathSet = new Set((stepDef as readonly string[]).map((p) => `${rootKey}.${p}`));
  return instances.filter((i) => pathSet.has(i.path));
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
