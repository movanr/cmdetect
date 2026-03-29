/**
 * Hook to check if a field is enabled based on its sibling's value.
 *
 * Reuses the same enableWhen semantics as the wizard mode (defined in model files),
 * but takes path + condition directly rather than requiring a QuestionInstance.
 */

import { useWatch } from "react-hook-form";

/**
 * Returns true if the sibling field matches the expected value.
 *
 * @param fieldPath - Full dot-path of the dependent field, e.g. "e4.maxUnassisted.left.temporalis.familiarPain"
 * @param sibling - Sibling key name, e.g. "pain"
 * @param equals - Value the sibling must equal for this field to be enabled, e.g. "yes"
 */
export function useSiblingEnabled(fieldPath: string, sibling: string, equals: unknown): boolean {
  const siblingPath = fieldPath.replace(/\.[^.]+$/, `.${sibling}`);
  const siblingValue = useWatch({ name: siblingPath });
  return siblingValue === equals;
}
