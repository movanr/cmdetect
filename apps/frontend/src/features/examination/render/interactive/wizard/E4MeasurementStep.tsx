/**
 * E4MeasurementStep - Step content for measurement steps.
 *
 * Displays instruction, measurement input, terminated checkbox (for E4B/E4C),
 * and navigation buttons.
 */

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, SkipForward } from "lucide-react";
import { InstructionBlock } from "../InstructionBlock";
import { MeasurementField } from "../../form-fields/MeasurementField";
import { TerminatedCheckbox } from "../../form-fields/TerminatedCheckbox";
import type { E4Step } from "./types";
import type { StepInstruction } from "../../../content/instructions";

interface E4MeasurementStepProps {
  /** Step definition */
  step: E4Step;
  /** Callback when advancing to next step */
  onNext: () => void;
  /** Callback when skipping this step */
  onSkip: () => void;
  /** Optional className */
  className?: string;
}

/**
 * Type guard to check if instruction is a StepInstruction.
 */
function isStepInstruction(
  instruction: E4Step["instruction"]
): instruction is StepInstruction {
  return "stepId" in instruction;
}

export function E4MeasurementStep({
  step,
  onNext,
  onSkip,
  className,
}: E4MeasurementStepProps) {
  const { watch, clearErrors } = useFormContext();

  // Watch terminated field and clear measurement error when checked
  const terminatedValue = step.terminatedField ? watch(step.terminatedField) : undefined;

  useEffect(() => {
    if (terminatedValue === true && step.measurementField) {
      clearErrors(step.measurementField);
    }
  }, [terminatedValue, step.measurementField, clearErrors]);

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/30 bg-card p-4 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Badge variant="default">{step.badge}</Badge>
        <h3 className="font-semibold">{step.title}</h3>
      </div>

      {/* Instruction */}
      {isStepInstruction(step.instruction) && (
        <InstructionBlock {...step.instruction} />
      )}

      {/* Measurement input */}
      <div className="flex items-center gap-6">
        {step.measurementField && step.measurementQuestion && (
          <MeasurementField
            name={step.measurementField}
            label="Messung"
            unit={step.measurementQuestion.unit ?? "mm"}
            min={step.measurementQuestion.min}
            max={step.measurementQuestion.max}
          />
        )}
        {step.terminatedField && (
          <TerminatedCheckbox name={step.terminatedField} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Überspringen
        </Button>
        <Button type="button" onClick={onNext}>
          Weiter
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
