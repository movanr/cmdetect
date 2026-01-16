import { useFormContext } from "react-hook-form";
import type { QuestionInstance } from "../projections/to-instances";

export function useFieldEnabled(instance: QuestionInstance): boolean {
  const { watch } = useFormContext();

  if (!instance.enableWhen) return true;

  const siblingPath = instance.path.replace(/\.[^.]+$/, `.${instance.enableWhen.sibling}`);
  return watch(siblingPath) === instance.enableWhen.equals;
}
