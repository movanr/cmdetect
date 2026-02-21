import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useCallback } from "react";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import {
  clearInstanceErrors,
  setInstanceValue,
} from "../../../form/form-helpers";
import type { FormValues } from "../../../form/use-examination-form";
import type { IncompleteRegion } from "../../../form/validation";
import { COMMON } from "../../../labels";
import type { Region, Side } from "../../../model/regions";
import type { QuestionInstance } from "../../../projections/to-instances";
import { RefusalCheckbox } from "../../inputs/RefusalCheckbox";
import { InterviewSubsection } from "./InterviewSubsection";
import type { ExpandedState } from "./types";

export interface InterviewContentProps {
  stepInstances: QuestionInstance[];
  regions: readonly Region[];
  expanded: ExpandedState;
  onExpandChange: (side: Side, region: Region | null) => void;
  incompleteRegions: IncompleteRegion[];
  onNoMorePainRegions: () => void;
  onClearIncompleteRegions: () => void;
}

export function InterviewContent({
  stepInstances,
  regions,
  expanded,
  onExpandChange,
  incompleteRegions,
  onNoMorePainRegions,
  onClearIncompleteRegions,
}: InterviewContentProps) {
  const { setValue, watch, clearErrors } = useFormContext<FormValues>();

  // Find the interviewRefused instance
  const interviewRefusedInst = stepInstances.find((i) => i.path.endsWith(".interviewRefused"));
  const interviewRefusedPath = interviewRefusedInst?.path as FieldPath<FormValues> | undefined;

  // Watch the refused state - watch returns the value at that path
  const watchedRefused = interviewRefusedPath ? watch(interviewRefusedPath) : undefined;
  const isInterviewRefused = (watchedRefused as unknown as boolean) === true;

  // Filter out the interviewRefused instance from stepInstances for InterviewSubsection
  const painInstances = stepInstances.filter((i) => !i.path.endsWith(".interviewRefused"));

  // Handle interview refusal change - clear all pain data when refusing
  const handleInterviewRefusalChange = useCallback(
    (refused: boolean) => {
      if (refused) {
        // Clear all pain interview data for this step
        for (const inst of painInstances) {
          if (inst.renderType === "yesNo") {
            setInstanceValue(setValue, inst.path, null);
            clearInstanceErrors(clearErrors, inst.path);
          }
        }
        // Clear any validation errors
        onClearIncompleteRegions();
      }
    },
    [painInstances, setValue, clearErrors, onClearIncompleteRegions]
  );

  if (isInterviewRefused) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p className="text-lg font-medium">{COMMON.refusedFull}</p>
          <p className="text-sm">{COMMON.refusedTooltip}</p>
        </div>
        {interviewRefusedPath && (
          <RefusalCheckbox<FormValues>
            name={interviewRefusedPath}
            onRefuseChange={handleInterviewRefusalChange}
          />
        )}
      </div>
    );
  }

  const unansweredPainPaths = painInstances
    .filter((i) => i.context.painType === "pain")
    .map((i) => i.path as FieldPath<FormValues>);
  const hasUnansweredPain = watch(unansweredPainPaths).some((v) => v == null);

  return (
    <>
      <InterviewSubsection
        instances={painInstances}
        regions={regions}
        expanded={expanded}
        onExpandChange={onExpandChange}
        incompleteRegions={incompleteRegions}
      />
      {hasUnansweredPain && (
        <div className="flex justify-center pt-2">
          <Button type="button" variant="outline" onClick={onNoMorePainRegions}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Keine weiteren Schmerzbereiche
          </Button>
        </div>
      )}
      {interviewRefusedPath && (
        <div className="pt-4 border-t">
          <RefusalCheckbox<FormValues>
            name={interviewRefusedPath}
            onRefuseChange={handleInterviewRefusalChange}
          />
        </div>
      )}
    </>
  );
}
