import type { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import type { QuestionInstance } from "../projections/to-instances";

type StepDefinition = readonly string[] | string;

export function createStepValidator<
  TFieldValues extends FieldValues,
  TSteps extends Record<string, StepDefinition>,
>(
  form: UseFormReturn<TFieldValues>,
  instances: QuestionInstance[],
  steps: TSteps,
  rootKey: string
) {
  return async (stepId: keyof TSteps): Promise<boolean> => {
    const stepPaths = steps[stepId];

    if (typeof stepPaths === "string" && stepPaths.endsWith(".*")) {
      // Wildcard: filter by context.side to get only interview questions
      const prefix = `${rootKey}.${stepPaths.slice(0, -2)}`;
      const paths = instances
        .filter((i) => i.path.startsWith(prefix) && i.context.side)
        .map((i) => i.path as FieldPath<TFieldValues>);
      return form.trigger(paths);
    }

    const pathsArray = stepPaths as readonly string[];
    return form.trigger(
      pathsArray.map((p) => `${rootKey}.${p}` as FieldPath<TFieldValues>)
    );
  };
}

export function getStepPaths<TSteps extends Record<string, StepDefinition>>(
  instances: QuestionInstance[],
  steps: TSteps,
  stepId: keyof TSteps,
  rootKey: string
): string[] {
  const stepPaths = steps[stepId];

  if (typeof stepPaths === "string" && stepPaths.endsWith(".*")) {
    const prefix = `${rootKey}.${stepPaths.slice(0, -2)}`;
    return instances
      .filter((i) => i.path.startsWith(prefix) && i.context.side)
      .map((i) => i.path);
  }

  const pathsArray = stepPaths as readonly string[];
  return pathsArray.map((p) => `${rootKey}.${p}`);
}
