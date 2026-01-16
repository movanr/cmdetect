import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { E4_MODEL, E4_STEPS } from "../sections/e4.model";
import { schemaWithRoot } from "../projections/to-schema";
import {
  instancesFromModel,
  defaultsFromModel,
} from "../projections/to-instances";
import { createPathHelpers } from "./path-helpers";

const schema = schemaWithRoot("e4", E4_MODEL);
type FormValues = z.infer<typeof schema>;

const e4Instances = instancesFromModel("e4", E4_MODEL);
const e4Defaults = defaultsFromModel(E4_MODEL);
const e4Paths = createPathHelpers<"e4">(e4Instances);

export function useExaminationForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { e4: e4Defaults } as FormValues,
  });

  const validateStep = async (stepId: keyof typeof E4_STEPS) => {
    const stepPaths = E4_STEPS[stepId];

    if (typeof stepPaths === "string" && stepPaths.endsWith(".*")) {
      // Wildcard: filter by context.side to get only interview questions
      const prefix = "e4." + stepPaths.slice(0, -2);
      const paths = e4Instances
        .filter((i) => i.path.startsWith(prefix) && i.context.side)
        .map((i) => i.path as FieldPath<FormValues>);
      return form.trigger(paths);
    }

    const pathsArray = stepPaths as readonly string[];
    return form.trigger(
      pathsArray.map((p) => `e4.${p}` as FieldPath<FormValues>)
    );
  };

  return { form, instances: e4Instances, paths: e4Paths, validateStep, schema };
}

export type { FormValues };
