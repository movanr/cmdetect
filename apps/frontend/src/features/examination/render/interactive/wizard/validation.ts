/**
 * validation.ts - Step validation for E4 wizard.
 *
 * Validates measurement steps (require value or terminated) and
 * interview steps (require all enabled questions to be answered).
 */

import type { E4Step } from "./types";
import type { Question } from "../../../model/question";
import { evaluateEnableWhen } from "../../../form/evaluateEnableWhen";

/**
 * Result of validating a wizard step.
 */
export interface StepValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

/**
 * Form value getter function type.
 */
export type FormValueGetter = (name: string) => unknown;

/**
 * Validates a measurement step.
 *
 * Rules:
 * - E4A/E4B (no terminated field): Require measurement value within min/max range
 * - E4C (has terminated field): Require measurement within range OR terminated checkbox checked
 * - Range validation uses min/max from measurementQuestion (single source of truth)
 */
export function validateMeasurementStep(
  step: E4Step,
  getValues: FormValueGetter
): StepValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!step.measurementField) {
    return { isValid: true, errors: [] };
  }

  const measurementValue = getValues(step.measurementField);
  const hasMeasurement =
    measurementValue !== undefined &&
    measurementValue !== null &&
    measurementValue !== "";

  // Check for E4C with terminated field
  if (step.terminatedField) {
    const terminated = getValues(step.terminatedField);
    const isTerminated = terminated === true;

    // Valid if either measurement entered OR terminated checked
    if (!hasMeasurement && !isTerminated) {
      errors.push({
        field: step.measurementField,
        message: "Bitte Messwert eingeben oder 'Abgebrochen' ankreuzen",
      });
    }
  } else {
    // E4A/E4B - just require measurement
    if (!hasMeasurement) {
      errors.push({
        field: step.measurementField,
        message: "Bitte Messwert eingeben",
      });
    }
  }

  // Range validation - only if we have a value and question definition
  if (hasMeasurement && step.measurementQuestion) {
    const numValue = Number(measurementValue);
    const { min, max, unit } = step.measurementQuestion;
    const unitLabel = unit ?? "mm";

    if (!Number.isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        errors.push({
          field: step.measurementField,
          message: `Wert muss mindestens ${min}${unitLabel} sein`,
        });
      }
      if (max !== undefined && numValue > max) {
        errors.push({
          field: step.measurementField,
          message: `Wert darf maximal ${max}${unitLabel} sein`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an interview step.
 *
 * Rules:
 * - All enabled questions must be answered
 * - Uses evaluateEnableWhen to determine which questions are enabled
 *
 * Note: This validates that all pain=yes regions have their follow-up questions answered.
 * Regions with pain=no or unanswered pain questions pass validation.
 */
export function validateInterviewStep(
  getValues: FormValueGetter,
  questions: Question[]
): StepValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  for (const question of questions) {
    // Check if this question should be answered using existing enableWhen evaluation
    const isEnabled = evaluateEnableWhen(question, getValues, questions);

    if (isEnabled) {
      const value = getValues(question.instanceId);
      if (value === undefined || value === null) {
        errors.push({
          field: question.instanceId,
          message: "Dieses Feld ist erforderlich",
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets all field names for a step (used for clearing errors).
 */
export function getStepFieldNames(
  step: E4Step,
  questions?: Question[]
): string[] {
  const fields: string[] = [];

  if (step.type === "measurement") {
    if (step.measurementField) {
      fields.push(step.measurementField);
    }
    if (step.terminatedField) {
      fields.push(step.terminatedField);
    }
  } else if (step.type === "interview" && questions) {
    // Return all question instanceIds for the interview step
    for (const question of questions) {
      fields.push(question.instanceId);
    }
  }

  return fields;
}
