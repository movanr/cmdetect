/**
 * E4InteractiveWizard - Main container for the 5-step E4 examination wizard.
 *
 * Layout:
 * - Completed/skipped steps shown as collapsed bars
 * - Current step shown expanded
 * - Pending steps shown as collapsed (non-interactive) bars
 */

import { cn } from "@/lib/utils";
import type { Region } from "../types";
import { E4_PAIN_REGIONS } from "../types";
import { useE4WizardState } from "./useE4WizardState";
import { E4StepBar } from "./E4StepBar";
import { E4MeasurementStep } from "./E4MeasurementStep";
import { E4PainInterviewStep } from "./E4PainInterviewStep";

interface E4InteractiveWizardProps {
  /** Regions to assess in interviews - defaults to E4_PAIN_REGIONS */
  regions?: readonly Region[];
  /** Optional className */
  className?: string;
}

export function E4InteractiveWizard({
  regions = E4_PAIN_REGIONS,
  className,
}: E4InteractiveWizardProps) {
  const {
    currentStepIndex,
    steps,
    isComplete,
    goToStep,
    completeCurrentStep,
    skipStep,
  } = useE4WizardState({ regions });

  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((stepState, index) => {
        const { step, status, summary } = stepState;
        const isActive = index === currentStepIndex;

        // Render collapsed bar for non-active steps
        if (!isActive) {
          return (
            <E4StepBar
              key={step.id}
              step={step}
              status={status}
              summary={summary}
              onClick={
                status === "completed" || status === "skipped"
                  ? () => goToStep(index)
                  : undefined
              }
            />
          );
        }

        // Render expanded content for active step
        if (step.type === "measurement") {
          return (
            <E4MeasurementStep
              key={step.id}
              step={step}
              onNext={completeCurrentStep}
              onSkip={skipStep}
            />
          );
        }

        if (step.type === "interview") {
          return (
            <E4PainInterviewStep
              key={step.id}
              step={step}
              regions={regions}
              onNext={completeCurrentStep}
              onSkip={skipStep}
            />
          );
        }

        return null;
      })}

      {/* Completion message when all steps are done */}
      {isComplete && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-green-800 font-medium">
            E4 Untersuchung abgeschlossen
          </p>
          <p className="text-sm text-green-600 mt-1">
            Alle Schritte wurden bearbeitet. Sie können einzelne Schritte durch
            Anklicken erneut bearbeiten.
          </p>
        </div>
      )}
    </div>
  );
}
