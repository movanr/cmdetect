import { zodResolver } from "@hookform/resolvers/zod";
import { useFormContext, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { M } from "../model/nodes";
import {
  defaultsFromModel,
  instancesFromModel,
  type QuestionInstance,
  type StepDefinition,
} from "../projections/to-instances";
import { schemaFromModel } from "../projections/to-schema";
import { SECTION_REGISTRY, type SectionId } from "../sections/registry";
import { createPathHelpers } from "./path-helpers";
import { validateInstances } from "./validation";

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
const EXAMINATION_MODEL = M.group(Object.fromEntries(SECTION_REGISTRY.map((s) => [s.id, s.model])));

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

// Schema is for type coercion only - all validation via validateInstances()
const schema = schemaFromModel(EXAMINATION_MODEL);
type FormValues = z.infer<typeof schema>;

/** Form configuration for ExaminationForm to use with useForm() */
export const examinationFormConfig = {
  resolver: zodResolver(schema as z.ZodTypeAny),
  defaultValues: defaults as FormValues,
};

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

/**
 * Hook for components that need examination form utilities.
 * Must be used within a FormProvider (provided by ExaminationForm).
 */
export function useExaminationForm() {
  const form = useFormContext<FormValues>();

  // Validate a specific step
  const validateStep = (stepId: ExaminationStepId): boolean => {
    const stepInstances = getStepInstancesForExamination(allInstances, stepId);

    // Clear existing errors for step fields
    for (const inst of stepInstances) {
      form.clearErrors(inst.path as FieldPath<FormValues>);
    }

    // Validate using the validation layer (single source of truth)
    const getValue = (path: string) => form.getValues(path as FieldPath<FormValues>);
    const result = validateInstances(stepInstances, getValue);

    // Set errors via RHF
    for (const error of result.errors) {
      form.setError(error.path as FieldPath<FormValues>, {
        type: "manual",
        message: error.message,
      });
    }

    return result.valid;
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

export { EXAMINATION_STEPS };
export type { FormValues };
