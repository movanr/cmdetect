import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { M } from "../model/nodes";
import { schemaFromModel } from "../projections/to-schema";
import {
  instancesFromModel,
  defaultsFromModel,
  type QuestionInstance,
  type StepDefinition,
} from "../projections/to-instances";
import { createPathHelpers } from "./path-helpers";
import { SECTION_REGISTRY, type SectionId } from "../sections/registry";

// Helper to get nested value by path
function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Add conditional validation for enableWhen fields
function withEnableWhenRefinement<T extends z.ZodTypeAny>(
  schema: T,
  instances: QuestionInstance[]
): z.ZodEffects<T, z.output<T>, z.input<T>> {
  return schema.superRefine((data: unknown, ctx) => {
    for (const inst of instances) {
      if (!inst.enableWhen) continue;

      const siblingPath = inst.path.replace(/\.[^.]+$/, `.${inst.enableWhen.sibling}`);
      const siblingValue = get(data, siblingPath);
      const currentValue = get(data, inst.path);

      // Only require value if field is enabled
      if (siblingValue === inst.enableWhen.equals && currentValue == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: inst.path.split("."),
        });
      }
    }
  });
}

// Helper to prefix paths in step definitions
function prefixStepPaths(
  steps: Record<string, StepDefinition>,
  prefix: string
): Record<string, StepDefinition> {
  return Object.fromEntries(
    Object.entries(steps).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, `${prefix}.${value}`];
      }
      return [key, value.map((p) => `${prefix}.${p}`)];
    })
  );
}

// Build combined model from registry
const EXAMINATION_MODEL = M.group(
  Object.fromEntries(SECTION_REGISTRY.map((s) => [s.id, s.model]))
);

// Build combined steps from registry
const EXAMINATION_STEPS = SECTION_REGISTRY.reduce(
  (acc, section) => ({
    ...acc,
    ...prefixStepPaths(section.steps, section.id),
  }),
  {} as Record<string, StepDefinition>
);

export type ExaminationStepId = keyof typeof EXAMINATION_STEPS;

// Generate instances from combined model
const allInstances: QuestionInstance[] = [];
for (const section of SECTION_REGISTRY) {
  allInstances.push(...instancesFromModel(section.id, section.model));
}

const defaults = defaultsFromModel(EXAMINATION_MODEL);
const pathHelpers = createPathHelpers(allInstances);

const baseSchema = schemaFromModel(EXAMINATION_MODEL);
const schema = withEnableWhenRefinement(baseSchema, allInstances);
type FormValues = z.infer<typeof baseSchema>;

export function useExaminationForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults as FormValues,
  });

  // Validate a specific step
  const validateStep = async (stepId: ExaminationStepId) => {
    const stepInstances = getStepInstancesForExamination(allInstances, stepId);
    const paths = stepInstances.map((i) => i.path as FieldPath<FormValues>);

    // Run base schema validation
    const baseValid = await form.trigger(paths);

    // Check enableWhen conditions manually (superRefine doesn't run on partial trigger)
    let enableWhenValid = true;
    for (const inst of stepInstances) {
      if (!inst.enableWhen) continue;

      const siblingPath = inst.path.replace(/\.[^.]+$/, `.${inst.enableWhen.sibling}`);
      const siblingValue = form.getValues(siblingPath as FieldPath<FormValues>);
      const currentValue = form.getValues(inst.path as FieldPath<FormValues>);

      if (siblingValue === inst.enableWhen.equals && currentValue == null) {
        form.setError(inst.path as FieldPath<FormValues>, {
          type: "required",
          message: "Required",
        });
        enableWhenValid = false;
      }
    }

    return baseValid && enableWhenValid;
  };

  // Get instances for a specific step
  const getInstancesForStep = (stepId: ExaminationStepId) =>
    getStepInstancesForExamination(allInstances, stepId);

  // Get all instances for a specific section
  const getInstancesForSection = (sectionId: SectionId) =>
    allInstances.filter((i) => i.path.startsWith(`${sectionId}.`));

  return {
    form,
    instances: allInstances,
    pathHelpers,
    validateStep,
    schema,
    getInstancesForStep,
    getInstancesForSection,
  };
}

// Get step instances using the combined steps definition
function getStepInstancesForExamination(
  instances: QuestionInstance[],
  stepId: ExaminationStepId
): QuestionInstance[] {
  const stepDef = EXAMINATION_STEPS[stepId];

  if (typeof stepDef === "string" && stepDef.endsWith(".*")) {
    // Wildcard: e.g., "e4.maxUnassisted.*" or "e9.left.*"
    const prefix = stepDef.slice(0, -2); // Remove ".*"
    return instances.filter((i) => i.path.startsWith(`${prefix}.`) && i.context.side);
  }

  // Explicit path array
  const pathSet = new Set(stepDef as readonly string[]);
  return instances.filter((i) => pathSet.has(i.path));
}

export { EXAMINATION_STEPS };
export type { FormValues };
