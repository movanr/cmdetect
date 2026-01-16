import type { EnableWhen } from "../model/conditions";
import { E4_REGIONS } from "../model/contexts";
import { E9_PALPATION_SITES, E9_SITE_CONFIG, type E9PalpationSite } from "../model/e9-contexts";
import type { ModelNode } from "../model/nodes";

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
    instances.push(...instancesFromModel(key, child, currentPath, enrichedContext));
  }
  return instances;
}

// Pain question types shared by E4 and E9
const PAIN_TYPES = [
  "pain",
  "familiarPain",
  "familiarHeadache",
  "referredPain",
  "spreadingPain",
] as const;

// Context enrichment for E4 and E9
function enrichContext(ctx: Record<string, string>, key: string): Record<string, string> {
  // Shared: sides
  if (key === "left" || key === "right") return { ...ctx, side: key };

  // E4: regions
  if (E4_REGIONS.includes(key as (typeof E4_REGIONS)[number])) {
    return { ...ctx, region: key };
  }

  // E9: palpation sites
  if (E9_PALPATION_SITES.includes(key as E9PalpationSite)) {
    const config = E9_SITE_CONFIG[key as E9PalpationSite];
    return { ...ctx, site: key, muscleGroup: config.muscleGroup };
  }

  // Shared: pain types
  if (PAIN_TYPES.includes(key as (typeof PAIN_TYPES)[number])) {
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
