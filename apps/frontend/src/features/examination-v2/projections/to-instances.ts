import type { EnableWhen } from "../model/conditions";
import {
  MOVEMENT_REGIONS,
  PALPATION_SITES,
  SITE_CONFIG,
  type MovementRegion,
  type PalpationSite,
} from "../model/regions";
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
export function enrichContext(ctx: Record<string, string>, key: string): Record<string, string> {
  // Shared: sides
  if (key === "left" || key === "right") return { ...ctx, side: key };

  // E4/E5: movement regions
  if (MOVEMENT_REGIONS.includes(key as MovementRegion)) {
    return { ...ctx, region: key };
  }

  // E9: palpation sites
  if (PALPATION_SITES.includes(key as PalpationSite)) {
    const config = SITE_CONFIG[key as PalpationSite];
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
