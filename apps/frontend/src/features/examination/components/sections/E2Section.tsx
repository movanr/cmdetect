/**
 * E2: Incisal Relationships Section
 *
 * Four-step flow:
 * - U2-ref: Reference tooth selection
 * - U2-mid: Midline deviation
 * - U2-hov: Horizontal overjet measurement
 * - U2-vov: Vertical overlap measurement
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { E2_RICH_INSTRUCTIONS } from "../../content/instructions";
import { useExaminationForm, type FormValues } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { QuestionField } from "../QuestionField";
import { IncompleteDataDialog, MeasurementFlowBlock, SectionFooter, StepBar, type StepStatus } from "../ui";
import type { SectionProps } from "./types";

// Step configuration
type E2StepId = "e2-ref" | "e2-mid" | "e2-hov" | "e2-vov";

const E2_STEP_ORDER: E2StepId[] = ["e2-ref", "e2-mid", "e2-hov", "e2-vov"];

const E2_STEP_CONFIG: Record<E2StepId, { badge: string; title: string }> = {
  "e2-ref": { badge: "U2", title: "Referenzzahn" },
  "e2-mid": { badge: "U2", title: "Mittellinienabweichung" },
  "e2-hov": { badge: "U2", title: "Horizontaler inzisaler Überbiss" },
  "e2-vov": { badge: "U2", title: "Vertikaler inzisaler Überbiss" },
};

interface E2SectionProps extends SectionProps {
  step?: number; // 1-indexed from URL, undefined = auto-detect
  onStepChange?: (stepIndex: number | null) => void; // 0-indexed, null = summary
}

/**
 * Check if a step has data (for computing initial state).
 */
function stepHasData(stepId: E2StepId, getValue: (path: string) => unknown): boolean {
  switch (stepId) {
    case "e2-ref": {
      const selection = getValue("e2.referenceTooth.selection");
      return selection != null && selection !== "";
    }
    case "e2-mid": {
      const direction = getValue("e2.midlineDeviation.direction");
      return direction != null && direction !== "";
    }
    case "e2-hov": {
      const value = getValue("e2.horizontalOverjet");
      return value != null && value !== "";
    }
    case "e2-vov": {
      const value = getValue("e2.verticalOverlap");
      return value != null && value !== "";
    }
    default:
      return false;
  }
}

/**
 * Get summary for a completed step.
 */
function getStepSummary(stepId: E2StepId, getValue: (path: string) => unknown): string {
  switch (stepId) {
    case "e2-ref": {
      const selection = getValue("e2.referenceTooth.selection") as string | undefined;
      if (selection === "other") {
        const other = getValue("e2.referenceTooth.otherTooth") as string | undefined;
        return other || "Anderer";
      }
      return selection || "—";
    }
    case "e2-mid": {
      const direction = getValue("e2.midlineDeviation.direction") as string | undefined;
      if (direction === "na") return "Keine Abweichung";
      const mm = getValue("e2.midlineDeviation.mm") as number | undefined;
      if (direction && mm != null) {
        const dirLabel = direction === "right" ? "rechts" : "links";
        return `${mm} mm nach ${dirLabel}`;
      }
      return direction || "—";
    }
    case "e2-hov": {
      const value = getValue("e2.horizontalOverjet") as number | undefined;
      return value != null ? `${value} mm` : "—";
    }
    case "e2-vov": {
      const value = getValue("e2.verticalOverlap") as number | undefined;
      return value != null ? `${value} mm` : "—";
    }
    default:
      return "—";
  }
}

export function E2Section({ step, onStepChange, onComplete, onBack, isFirstSection }: E2SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();
  const { getValues } = useFormContext<FormValues>();

  const instances = getInstancesForStep("e2-all");

  // Find specific instances for layout
  const referenceToothSelection = instances.find((i) => i.path === "e2.referenceTooth.selection");
  const referenceToothOther = instances.find((i) => i.path === "e2.referenceTooth.otherTooth");
  const horizontalOverjet = instances.find((i) => i.path === "e2.horizontalOverjet");
  const verticalOverlap = instances.find((i) => i.path === "e2.verticalOverlap");
  const midlineDirection = instances.find((i) => i.path === "e2.midlineDeviation.direction");
  const midlineMm = instances.find((i) => i.path === "e2.midlineDeviation.mm");

  // Keep stepStatuses in state (computed from form on mount)
  const [stepStatuses, setStepStatuses] = useState<Record<string, "completed" | "skipped">>(() => {
    const statuses: Record<string, "completed" | "skipped"> = {};
    for (const stepId of E2_STEP_ORDER) {
      if (stepHasData(stepId, (path) => getValues(path as FieldPath<FormValues>))) {
        statuses[stepId] = "completed";
      }
    }
    return statuses;
  });
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  // Derive currentStepIndex from URL prop
  const currentStepIndex = useMemo(() => {
    if (step !== undefined) {
      const index = step - 1; // Convert 1-indexed to 0-indexed
      if (index >= 0 && index < E2_STEP_ORDER.length) {
        return index;
      }
    }
    // Auto-detect: find first incomplete step
    for (let i = 0; i < E2_STEP_ORDER.length; i++) {
      if (!stepStatuses[E2_STEP_ORDER[i]]) return i;
    }
    return -1; // All complete
  }, [step, stepStatuses]);

  // Derived state
  const allComplete = currentStepIndex === -1;
  const currentStepId = allComplete ? E2_STEP_ORDER[0] : E2_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E2_STEP_ORDER.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Navigation handlers
  const handleBack = () => {
    if (isFirstStep) {
      onBack?.();
    } else {
      onStepChange?.(currentStepIndex - 1);
    }
  };

  const performSkip = () => {
    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "skipped" }));
    if (isLastStep) {
      onComplete?.();
    } else {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    performSkip();
  };

  const handleNext = () => {
    // Validate current step (triggers form errors)
    const isValid = validateStep(currentStepId);

    if (!isValid) {
      // Invalid data - show skip confirmation dialog
      setShowSkipDialog(true);
      return;
    }

    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "completed" }));

    if (isLastStep) {
      onComplete?.();
    } else {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  const getStatus = (stepId: E2StepId, index: number): StepStatus => {
    if (allComplete) {
      return stepStatuses[stepId] || "pending";
    }
    if (index === currentStepIndex) return "active";
    if (stepStatuses[stepId]) return stepStatuses[stepId];
    return "pending";
  };

  const getSummary = (stepId: E2StepId): string => {
    return getStepSummary(stepId, (path) => getValues(path as FieldPath<FormValues>));
  };

  // Render active step content
  const renderStepContent = (stepId: E2StepId) => {
    switch (stepId) {
      case "e2-ref":
        return (
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.referenceTooth} />
            <div className="max-w-sm space-y-4">
              <h4 className="text-sm font-medium">{E2_STEP_CONFIG["e2-ref"].title}</h4>
              {referenceToothSelection && <QuestionField instance={referenceToothSelection} />}
              {referenceToothOther && <QuestionField instance={referenceToothOther} />}
            </div>
          </div>
        );

      case "e2-mid":
        return (
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.midlineDeviation} />
            <div className="max-w-sm space-y-4">
              <h4 className="text-sm font-medium">{E2_STEP_CONFIG["e2-mid"].title}</h4>
              {midlineDirection && <QuestionField instance={midlineDirection} label="Richtung" />}
              {midlineMm && <QuestionField instance={midlineMm} label="Abweichung" />}
            </div>
          </div>
        );

      case "e2-hov":
        return (
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.horizontalOverjet} />
            <div className="max-w-sm space-y-4">
              <h4 className="text-sm font-medium">{E2_STEP_CONFIG["e2-hov"].title}</h4>
              {horizontalOverjet && <QuestionField instance={horizontalOverjet} />}
              <p className="text-xs text-muted-foreground">Negativer Wert bei Kreuzbiss</p>
            </div>
          </div>
        );

      case "e2-vov":
        return (
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.verticalOverlap} />
            <div className="max-w-sm space-y-4">
              <h4 className="text-sm font-medium">{E2_STEP_CONFIG["e2-vov"].title}</h4>
              {verticalOverlap && <QuestionField instance={verticalOverlap} />}
              <p className="text-xs text-muted-foreground">Negativer Wert bei offenem Biss</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getSectionCardTitle(SECTIONS.e2)}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/protocol/$section" params={{ section: "e2" }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Protokoll
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {E2_STEP_ORDER.map((stepId, index) => {
          const config = E2_STEP_CONFIG[stepId];
          const status = getStatus(stepId, index);

          if (status === "active") {
            return (
              <div
                key={stepId}
                className="rounded-lg border border-primary/30 bg-card p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <Badge>{config.badge}</Badge>
                  <h3 className="font-semibold">{config.title}</h3>
                </div>

                {/* Content */}
                {renderStepContent(stepId)}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isFirstStep && (isFirstSection || !onBack)}
                    className="text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Zurück
                  </Button>

                  <Button type="button" onClick={handleNext}>
                    {isLastStep ? "Abschließen" : "Weiter"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            );
          }

          // Collapsed step
          return (
            <StepBar
              key={stepId}
              config={config}
              status={status}
              summary={status === "pending" ? "—" : getSummary(stepId)}
              onClick={() => onStepChange?.(index)}
            />
          );
        })}

        <IncompleteDataDialog
          open={showSkipDialog}
          onOpenChange={setShowSkipDialog}
          onConfirm={handleConfirmSkip}
        />
      </CardContent>

      {/* Section-level footer when all steps are complete */}
      {allComplete && (
        <SectionFooter
          onNext={onComplete}
          onBack={onBack}
          isFirstStep={isFirstSection}
        />
      )}
    </Card>
  );
}
