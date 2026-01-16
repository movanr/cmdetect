/**
 * useE4WizardState - State management for E4 interactive wizard.
 *
 * Manages step navigation and computes summaries from form values.
 * The wizard is purely UI orchestration - it doesn't change how data is stored.
 */

import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { E4_INSTRUCTIONS } from "../../../content/instructions";
import { ANSWER_VALUES } from "../../../model/answer";
import { QUESTIONNAIRE_ID } from "../../../model/constants";
import { MEASUREMENT_IDS } from "../../../model/measurement";
import { MOVEMENTS, type Movement } from "../../../model/movement";
import { PAIN_TYPES } from "../../../model/pain";
import { buildInstanceId } from "../../../model/questionInstance";
import { SIDES } from "../../../model/side";
import type { Region } from "../types";
import type { E4Step, E4StepId, E4StepState, E4WizardActions, StepStatus } from "./types";

/**
 * Step definitions for the E4 wizard.
 * Badges for measurement steps are derived from instruction.stepId.
 * Interview steps share the badge of their associated measurement step.
 */
const E4_STEPS: E4Step[] = [
  {
    id: "e4a-measurement",
    title: E4_INSTRUCTIONS.painFreeOpening.title,
    shortTitle: E4_INSTRUCTIONS.painFreeOpening.title,
    badge: E4_INSTRUCTIONS.painFreeOpening.stepId,
    type: "measurement",
    measurementField: `${QUESTIONNAIRE_ID}.${MEASUREMENT_IDS.PAIN_FREE_OPENING}`,
    instruction: E4_INSTRUCTIONS.painFreeOpening,
  },
  {
    id: "e4b-measurement",
    title: E4_INSTRUCTIONS.maxUnassistedOpening.title,
    shortTitle: E4_INSTRUCTIONS.maxUnassistedOpening.title,
    badge: E4_INSTRUCTIONS.maxUnassistedOpening.stepId,
    type: "measurement",
    movement: MOVEMENTS.MAX_UNASSISTED_OPENING,
    measurementField: `${QUESTIONNAIRE_ID}.${MOVEMENTS.MAX_UNASSISTED_OPENING}`,
    terminatedField: `${QUESTIONNAIRE_ID}.${MEASUREMENT_IDS.TERMINATED}:movement=${MOVEMENTS.MAX_UNASSISTED_OPENING}`,
    instruction: E4_INSTRUCTIONS.maxUnassistedOpening,
  },
  {
    id: "e4b-interview",
    title: `${E4_INSTRUCTIONS.maxUnassistedOpening.title} - ${E4_INSTRUCTIONS.painInterview.title}`,
    shortTitle: E4_INSTRUCTIONS.painInterview.title,
    badge: E4_INSTRUCTIONS.maxUnassistedOpening.stepId,
    type: "interview",
    movement: MOVEMENTS.MAX_UNASSISTED_OPENING,
    instruction: E4_INSTRUCTIONS.painInterview,
  },
  {
    id: "e4c-measurement",
    title: E4_INSTRUCTIONS.maxAssistedOpening.title,
    shortTitle: E4_INSTRUCTIONS.maxAssistedOpening.title,
    badge: E4_INSTRUCTIONS.maxAssistedOpening.stepId,
    type: "measurement",
    movement: MOVEMENTS.MAX_ASSISTED_OPENING,
    measurementField: `${QUESTIONNAIRE_ID}.${MOVEMENTS.MAX_ASSISTED_OPENING}`,
    terminatedField: `${QUESTIONNAIRE_ID}.${MEASUREMENT_IDS.TERMINATED}:movement=${MOVEMENTS.MAX_ASSISTED_OPENING}`,
    instruction: E4_INSTRUCTIONS.maxAssistedOpening,
  },
  {
    id: "e4c-interview",
    title: `${E4_INSTRUCTIONS.maxAssistedOpening.title} - ${E4_INSTRUCTIONS.painInterview.title}`,
    shortTitle: E4_INSTRUCTIONS.painInterview.title,
    badge: E4_INSTRUCTIONS.maxAssistedOpening.stepId,
    type: "interview",
    movement: MOVEMENTS.MAX_ASSISTED_OPENING,
    instruction: E4_INSTRUCTIONS.painInterview,
  },
];

interface UseE4WizardStateProps {
  /** Regions to assess in interviews */
  regions: readonly Region[];
}

interface UseE4WizardStateReturn extends E4WizardActions {
  /** Current step index */
  currentStepIndex: number;
  /** All steps with runtime state */
  steps: E4StepState[];
  /** Current step definition (null if wizard completed) */
  currentStep: E4Step | null;
  /** Whether on first step */
  isFirstStep: boolean;
  /** Whether on last step */
  isLastStep: boolean;
  /** Whether wizard is complete (past last step) */
  isComplete: boolean;
}

/**
 * Count regions with pain=yes for a specific movement.
 */
function countPainRegions(
  getValues: (name: string) => unknown,
  movement: Movement,
  regions: readonly Region[]
): number {
  let count = 0;
  for (const side of Object.values(SIDES)) {
    for (const region of regions) {
      const instanceId = buildInstanceId(QUESTIONNAIRE_ID, PAIN_TYPES.PAIN, {
        movement,
        side,
        region,
      });
      if (getValues(instanceId) === ANSWER_VALUES.YES) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Compute summary text for a step based on form values.
 */
function computeStepSummary(
  step: E4Step,
  getValues: (name: string) => unknown,
  regions: readonly Region[]
): string {
  if (step.type === "measurement") {
    const value = step.measurementField ? getValues(step.measurementField) : undefined;

    // Check terminated state for E4B/E4C
    if (step.terminatedField) {
      const terminated = getValues(step.terminatedField);
      if (terminated === true) {
        return "Abgebrochen";
      }
    }

    if (value !== undefined && value !== null && value !== "") {
      return `${value}mm`;
    }
    return "—";
  }

  if (step.type === "interview" && step.movement) {
    const painCount = countPainRegions(getValues, step.movement, regions);
    if (painCount === 0) {
      return "Kein Schmerz";
    }
    return painCount === 1 ? "1 Schmerzregion" : `${painCount} Schmerzregionen`;
  }

  return "—";
}

/**
 * Determine step status based on index and current position.
 */
function getStepStatus(
  stepIndex: number,
  currentStepIndex: number,
  skippedSteps: Set<E4StepId>
): StepStatus {
  const step = E4_STEPS[stepIndex];
  if (skippedSteps.has(step.id)) {
    return "skipped";
  }
  if (stepIndex < currentStepIndex) {
    return "completed";
  }
  if (stepIndex === currentStepIndex) {
    return "active";
  }
  return "pending";
}

export function useE4WizardState({ regions }: UseE4WizardStateProps): UseE4WizardStateReturn {
  const { getValues, watch } = useFormContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState<Set<E4StepId>>(new Set());

  // Watch form values to trigger re-renders when they change
  // This ensures summaries update reactively
  watch();

  // Build step states with computed summaries
  const steps = useMemo((): E4StepState[] => {
    return E4_STEPS.map((step, index) => ({
      step,
      status: getStepStatus(index, currentStepIndex, skippedSteps),
      summary: computeStepSummary(step, getValues, regions),
    }));
  }, [currentStepIndex, skippedSteps, getValues, regions]);

  // Current step (null if complete)
  const currentStep = useMemo((): E4Step | null => {
    if (currentStepIndex >= E4_STEPS.length) {
      return null;
    }
    return E4_STEPS[currentStepIndex];
  }, [currentStepIndex]);

  // Navigation flags
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === E4_STEPS.length - 1;
  const isComplete = currentStepIndex >= E4_STEPS.length;

  // Navigate to specific step
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < E4_STEPS.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  // Advance to next step
  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, E4_STEPS.length));
  }, []);

  // Skip current step
  const skipStep = useCallback(() => {
    if (currentStepIndex < E4_STEPS.length) {
      const currentStepId = E4_STEPS[currentStepIndex].id;
      setSkippedSteps((prev) => new Set(prev).add(currentStepId));
      setCurrentStepIndex((prev) => Math.min(prev + 1, E4_STEPS.length));
    }
  }, [currentStepIndex]);

  // Complete current step and advance
  const completeCurrentStep = useCallback(() => {
    // Remove from skipped if it was previously skipped
    if (currentStepIndex < E4_STEPS.length) {
      const currentStepId = E4_STEPS[currentStepIndex].id;
      setSkippedSteps((prev) => {
        const next = new Set(prev);
        next.delete(currentStepId);
        return next;
      });
    }
    nextStep();
  }, [currentStepIndex, nextStep]);

  return {
    currentStepIndex,
    steps,
    currentStep,
    isFirstStep,
    isLastStep,
    isComplete,
    goToStep,
    nextStep,
    skipStep,
    completeCurrentStep,
  };
}

// Export step definitions for testing/reference
export { E4_STEPS };
