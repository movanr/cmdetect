import type { MovementRegion, Side } from "../model/regions";
import type { QuestionInstance } from "../projections/to-instances";

type ValueGetter = (path: string) => unknown;

/**
 * Represents a region with incomplete pain interview data.
 */
export interface IncompleteRegion {
  region: MovementRegion;
  side: Side;
  missingPain: boolean;
  missingFamiliarPain: boolean;
  missingFamiliarHeadache: boolean;
}

export interface InterviewValidationResult {
  valid: boolean;
  incompleteRegions: IncompleteRegion[];
}

/**
 * Validate that all pain interview questions are complete.
 *
 * Rules:
 * - All pain questions must be answered (not undefined)
 * - If pain=yes, familiarPain must be answered
 * - If pain=yes AND region is temporalis, familiarHeadache must also be answered
 */
export function validateInterviewCompletion(
  instances: QuestionInstance[],
  getValue: ValueGetter
): InterviewValidationResult {
  const incompleteRegions: IncompleteRegion[] = [];

  // Group instances by region and side
  const regionGroups = new Map<string, QuestionInstance[]>();
  for (const inst of instances) {
    const { region, side } = inst.context;
    if (!region || !side) continue;
    const key = `${region}-${side}`;
    const existing = regionGroups.get(key);
    if (existing) {
      existing.push(inst);
    } else {
      regionGroups.set(key, [inst]);
    }
  }

  // Check each region/side combination
  for (const [key, questions] of regionGroups) {
    const [region, side] = key.split("-") as [MovementRegion, Side];

    const painQ = questions.find((q) => q.context.painType === "pain");
    const familiarPainQ = questions.find((q) => q.context.painType === "familiarPain");
    const familiarHeadacheQ = questions.find((q) => q.context.painType === "familiarHeadache");

    const painValue = painQ ? getValue(painQ.path) : null;
    const familiarPainValue = familiarPainQ ? getValue(familiarPainQ.path) : null;
    const familiarHeadacheValue = familiarHeadacheQ ? getValue(familiarHeadacheQ.path) : null;

    const missingPain = painValue == null;
    const missingFamiliarPain = painValue === "yes" && familiarPainValue == null;
    const missingFamiliarHeadache =
      painValue === "yes" && familiarHeadacheQ != null && familiarHeadacheValue == null;

    if (missingPain || missingFamiliarPain || missingFamiliarHeadache) {
      incompleteRegions.push({
        region,
        side,
        missingPain,
        missingFamiliarPain,
        missingFamiliarHeadache,
      });
    }
  }

  return {
    valid: incompleteRegions.length === 0,
    incompleteRegions,
  };
}

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
      errors.push({ path: instance.path, message: "Dieses Feld ist erforderlich" });
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
