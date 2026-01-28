import { useFormContext } from "react-hook-form";
import type { QuestionInstance } from "../projections/to-instances";

export function useFieldEnabled(instance: QuestionInstance): boolean {
  const { watch } = useFormContext();

  if (!instance.enableWhen) return true;

  const siblingPath = instance.path.replace(/\.[^.]+$/, `.${instance.enableWhen.sibling}`);
  const siblingValue = watch(siblingPath);

  // Handle equals condition
  if (instance.enableWhen.equals !== undefined) {
    return siblingValue === instance.enableWhen.equals;
  }

  // Handle notEquals condition
  if (instance.enableWhen.notEquals !== undefined) {
    return siblingValue !== instance.enableWhen.notEquals;
  }

  return true;
}
