import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { E4_MODEL, E4_STEPS } from "../sections/e4.model";
import { schemaWithRoot } from "../projections/to-schema";
import {
  instancesFromModel,
  defaultsFromModel,
  getStepInstances,
  type QuestionInstance,
} from "../projections/to-instances";
import { createPathHelpers } from "./path-helpers";

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

// Generate instances and schema (generic naming for extensibility)
const instances = instancesFromModel("e4", E4_MODEL);
const defaults = defaultsFromModel(E4_MODEL);
const pathHelpers = createPathHelpers(instances);

const baseSchema = schemaWithRoot("e4", E4_MODEL);
const schema = withEnableWhenRefinement(baseSchema, instances);
type FormValues = z.infer<typeof baseSchema>;

export function useExaminationForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { e4: defaults } as FormValues,
  });

  const validateStep = async (stepId: keyof typeof E4_STEPS) => {
    const stepInstances = getStepInstances(instances, E4_STEPS, stepId, "e4");
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

  const getInstancesForStep = (stepId: keyof typeof E4_STEPS) =>
    getStepInstances(instances, E4_STEPS, stepId, "e4");

  return { form, instances, pathHelpers, validateStep, schema, getInstancesForStep };
}

export type { FormValues };
