import type { QuestionInstance } from "../projections/to-instances";

type ValueGetter = (path: string) => unknown;

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
}

/**
 * Check if a field is enabled based on its enableWhen condition.
 * Disabled fields should not be validated.
 */
export function isFieldEnabled(
  instance: QuestionInstance,
  getSiblingValue: ValueGetter
): boolean {
  if (!instance.enableWhen) return true;
  const siblingPath = instance.path.replace(/\.[^.]+$/, `.${instance.enableWhen.sibling}`);
  return getSiblingValue(siblingPath) === instance.enableWhen.equals;
}

/**
 * Single source of truth for all form validation rules.
 * Returns a list of errors for the given instances.
 */
export function validateInstances(
  instances: QuestionInstance[],
  getValue: ValueGetter
): ValidationResult {
  const errors: Array<{ path: string; message: string }> = [];

  for (const instance of instances) {
    // Skip disabled fields
    if (!isFieldEnabled(instance, getValue)) continue;

    const value = getValue(instance.path);
    const config = instance.config as { required?: boolean; min?: number; max?: number };

    // Required validation
    if (config.required && (value == null || value === "")) {
      errors.push({ path: instance.path, message: "Required" });
      continue; // Skip further checks for this field
    }

    // Range validation for measurements
    if (instance.renderType === "measurement" && value != null && value !== "") {
      const numValue = Number(value);
      const min = config.min ?? 0;
      const max = config.max ?? 100;
      if (numValue < min) {
        errors.push({ path: instance.path, message: `Minimum: ${min}` });
      } else if (numValue > max) {
        errors.push({ path: instance.path, message: `Maximum: ${max}` });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
