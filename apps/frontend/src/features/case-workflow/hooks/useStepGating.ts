/**
 * Step Gating Hook
 *
 * Enforces step access control based on completed steps.
 * Provides navigation helpers that respect workflow prerequisites.
 */

import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  canAccessStep,
  getFirstSubStep,
  getStepDefinition,
  type MainStep,
} from "../types/workflow";

interface UseStepGatingOptions {
  caseId: string;
  completedSteps: Set<MainStep>;
  currentStep: MainStep;
}

interface StepGatingResult {
  /** Check if a step can be accessed */
  canAccess: (step: MainStep) => boolean;

  /** Navigate to a step (respects gating) */
  navigateToStep: (step: MainStep, options?: { force?: boolean }) => void;

  /** Navigate to the next available step */
  navigateToNext: () => void;

  /** Get the first locked step */
  getFirstLockedStep: () => MainStep | undefined;

  /** Check if the current step is accessible */
  isCurrentStepAccessible: boolean;

  /** The step user should be redirected to if current is not accessible */
  redirectStep: MainStep | undefined;
}

export function useStepGating(options: UseStepGatingOptions): StepGatingResult {
  const { caseId, completedSteps, currentStep } = options;
  const navigate = useNavigate();

  // Check if current step is accessible
  const isCurrentStepAccessible = useMemo(
    () => canAccessStep(currentStep, completedSteps),
    [currentStep, completedSteps]
  );

  // Determine redirect step if current is not accessible
  const redirectStep = useMemo(() => {
    if (isCurrentStepAccessible) return undefined;

    // Find the last accessible step
    const steps: MainStep[] = ["anamnesis", "examination", "evaluation", "documentation"];
    let lastAccessible: MainStep = "anamnesis";

    for (const step of steps) {
      if (canAccessStep(step, completedSteps)) {
        lastAccessible = step;
      } else {
        break;
      }
    }

    return lastAccessible;
  }, [isCurrentStepAccessible, completedSteps]);

  // Check if a step can be accessed
  const canAccess = useCallback(
    (step: MainStep) => canAccessStep(step, completedSteps),
    [completedSteps]
  );

  // Navigate to a step
  const navigateToStep = useCallback(
    (step: MainStep, navOptions?: { force?: boolean }) => {
      const { force = false } = navOptions ?? {};

      // Check access unless forced
      if (!force && !canAccessStep(step, completedSteps)) {
        console.warn(`Cannot access step "${step}" - prerequisites not met`);
        return;
      }

      const stepDef = getStepDefinition(step);
      if (!stepDef) return;

      const firstSubStep = getFirstSubStep(step);
      const route = firstSubStep
        ? `/cases/$id/${step}/${firstSubStep}`
        : `/cases/$id/${step}`;

      navigate({ to: route, params: { id: caseId } });
    },
    [caseId, completedSteps, navigate]
  );

  // Navigate to next available step
  const navigateToNext = useCallback(() => {
    const steps: MainStep[] = ["anamnesis", "examination", "evaluation", "documentation"];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex === -1 || currentIndex === steps.length - 1) return;

    const nextStep = steps[currentIndex + 1];
    if (canAccessStep(nextStep, completedSteps)) {
      navigateToStep(nextStep);
    }
  }, [currentStep, completedSteps, navigateToStep]);

  // Get first locked step
  const getFirstLockedStep = useCallback(() => {
    const steps: MainStep[] = ["anamnesis", "examination", "evaluation", "documentation"];
    return steps.find((step) => !canAccessStep(step, completedSteps));
  }, [completedSteps]);

  return {
    canAccess,
    navigateToStep,
    navigateToNext,
    getFirstLockedStep,
    isCurrentStepAccessible,
    redirectStep,
  };
}
