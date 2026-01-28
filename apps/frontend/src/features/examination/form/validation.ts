import type { Region, Side } from "../model/regions";
import type { QuestionInstance } from "../projections/to-instances";

type ValueGetter = (path: string) => unknown;

/**
 * Represents a region with incomplete pain interview data.
 */
export interface IncompleteRegion {
  region: Region;
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
    const [region, side] = key.split("-") as [Region, Side];

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
 * Helper to get sibling terminated path from a measurement path.
 * e.g., "e4.maxAssisted.measurement" → "e4.maxAssisted.terminated"
 */
function getTerminatedSiblingPath(path: string): string {
  return path.replace(/\.[^.]+$/, ".terminated");
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

    // Measurement-specific required validation
    if (instance.renderType === "measurement" && config.required) {
      const terminatedPath = getTerminatedSiblingPath(instance.path);
      const terminatedValue = getValue(terminatedPath);

      // Check if terminated sibling exists (not undefined) and is checked
      const hasTerminatedSibling = terminatedValue !== undefined;
      const isTerminated = terminatedValue === true;

      if (value == null || value === "") {
        if (isTerminated) {
          // Terminated is checked - measurement not required, skip validation
          continue;
        }
        // Choose message based on whether terminated sibling exists
        const message = hasTerminatedSibling
          ? "Bitte Messwert eingeben oder 'Abgebrochen' ankreuzen"
          : "Bitte Messwert eingeben";
        errors.push({ path: instance.path, message });
        continue;
      }

      // Range validation for measurements with values
      const numValue = Number(value);
      const min = config.min ?? 0;
      const max = config.max ?? 100;
      if (numValue < min) {
        errors.push({ path: instance.path, message: `Minimum: ${min}` });
      } else if (numValue > max) {
        errors.push({ path: instance.path, message: `Maximum: ${max}` });
      }
      continue;
    }

    // Generic required validation (non-measurement fields)
    if (config.required && (value == null || value === "")) {
      errors.push({ path: instance.path, message: "Dieses Feld ist erforderlich" });
      continue;
    }

    // Range validation for non-required measurements with values
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
