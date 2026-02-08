import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ChevronLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { FieldPath } from "react-hook-form";
import { E5_RICH_INSTRUCTIONS } from "../../content/instructions";
import { useScrollToActiveStep } from "../../hooks/use-scroll-to-active-step";
import { setInstanceValue } from "../../form/form-helpers";
import {
  useExaminationForm,
  type ExaminationStepId,
  type FormValues,
} from "../../form/use-examination-form";
import { validateInterviewCompletion, type IncompleteRegion } from "../../form/validation";
import { COMMON, getSectionCardTitle } from "../../labels";
import { ALL_REGIONS, BASE_REGIONS, type Region, type Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import {
  IncompleteDataDialog,
  MeasurementFlowBlock,
  MeasurementStep,
  PainInterviewBlock,
  SectionFooter,
  StepBar,
  type StepStatus,
} from "../ui";
import { InterviewContent } from "./e4/InterviewContent";
import type { ExpandedState } from "./e4/types";
import type { SectionProps } from "./types";

// Step configuration
type E5StepId = "e5-intro" | ExaminationStepId;

const E5_STEP_ORDER: E5StepId[] = [
  "e5-intro",
  "e5a-measure",
  "e5a-interview",
  "e5b-measure",
  "e5b-interview",
  "e5c-measure",
  "e5c-interview",
];

const E5_STEP_CONFIG: Record<string, { badge: string; title: string }> = {
  "e5-intro": { badge: "U5", title: "Einführung Lateralbewegungen" },
  "e5a-measure": { badge: "U5A", title: "Laterotrusion rechts" },
  "e5a-interview": { badge: "U5A", title: "Schmerzbefragung" },
  "e5b-measure": { badge: "U5B", title: "Laterotrusion links" },
  "e5b-interview": { badge: "U5B", title: "Schmerzbefragung" },
  "e5c-measure": { badge: "U5C", title: "Protrusion" },
  "e5c-interview": { badge: "U5C", title: "Schmerzbefragung" },
};

const isInterviewStep = (id: string) => id.endsWith("-interview");

interface E5SectionProps extends SectionProps {
  step?: number; // 1-indexed from URL, undefined = auto-detect
  onStepChange?: (stepIndex: number | null) => void; // 0-indexed, null = summary
}

/**
 * Compute step completion status from form values.
 * Returns "completed" if the step has valid data, "refused" if refused, null otherwise.
 */
function computeStepStatusFromForm(
  stepId: E5StepId,
  instances: QuestionInstance[],
  getValue: (path: string) => unknown
): "completed" | "refused" | null {
  if (stepId === "e5-intro") return null;
  const isInterview = isInterviewStep(String(stepId));

  if (isInterview) {
    // Check for interview refusal first
    const interviewRefusedInst = instances.find((i) => i.path.endsWith(".interviewRefused"));
    if (interviewRefusedInst) {
      // Also check if parent measurement was refused (auto-skip on remount)
      const measurementRefusedPath = interviewRefusedInst.path.replace(".interviewRefused", ".refused");
      if (getValue(measurementRefusedPath) === true) return "refused";
      if (getValue(interviewRefusedInst.path) === true) return "refused";
    }
    // Check if all pain questions are answered
    const result = validateInterviewCompletion(instances, getValue);
    return result.valid ? "completed" : null;
  }

  // Measurement step - check for refusal first
  const refusedInst = instances.find((i) => i.path.endsWith(".refused"));
  if (refusedInst && getValue(refusedInst.path) === true) {
    return "refused";
  }

  // Check if measurement field has value
  const measurementInst = instances.find((i) => i.renderType === "measurement");
  if (measurementInst) {
    const value = getValue(measurementInst.path);
    if (value != null && value !== "") {
      return "completed";
    }
  }

  return null;
}

export function E5Section({ step, onStepChange, onComplete, onBack, isFirstSection }: E5SectionProps) {
  const { form, validateStep, getInstancesForStep } = useExaminationForm();
  const activeStepRef = useScrollToActiveStep(step ?? 0);

  // Keep stepStatuses in state (computed from form on mount)
  const [stepStatuses, setStepStatuses] = useState<Record<string, "completed" | "skipped" | "refused">>(() => {
    const statuses: Record<string, "completed" | "skipped" | "refused"> = {};
    for (const stepId of E5_STEP_ORDER) {
      if (stepId === "e5-intro") continue;
      const instances = getInstancesForStep(stepId);
      const status = computeStepStatusFromForm(stepId, instances, (path) =>
        form.getValues(path as FieldPath<FormValues>)
      );
      if (status) statuses[stepId] = status;
    }
    return statuses;
  });
  const [incompleteRegions, setIncompleteRegions] = useState<IncompleteRegion[]>([]);
  const [includeAllRegions, setIncludeAllRegions] = useState(false);

  // Track expanded dropdowns for interview steps
  const [expanded, setExpanded] = useState<ExpandedState>({ left: null, right: null });
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  // Derive currentStepIndex from URL prop
  const currentStepIndex = useMemo(() => {
    if (step !== undefined) {
      const index = step - 1; // Convert 1-indexed to 0-indexed
      if (index >= 0 && index < E5_STEP_ORDER.length) {
        return index;
      }
    }
    // Auto-detect: find first incomplete step
    for (let i = 0; i < E5_STEP_ORDER.length; i++) {
      if (!stepStatuses[E5_STEP_ORDER[i]]) return i;
    }
    return -1; // All complete
  }, [step, stepStatuses]);

  // -1 means all steps are complete
  const allComplete = currentStepIndex === -1;
  const currentStepId = allComplete ? E5_STEP_ORDER[0] : E5_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E5_STEP_ORDER.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const isInterview = isInterviewStep(String(currentStepId));
  const stepInstances = allComplete || currentStepId === "e5-intro" ? [] : getInstancesForStep(currentStepId as ExaminationStepId);

  // Determine which regions to show
  const regions = includeAllRegions ? ALL_REGIONS : BASE_REGIONS;

  // Handle expanded state changes - only one region selectable at a time across both sides
  const handleExpandChange = useCallback((side: Side, region: Region | null) => {
    const otherSide = side === "left" ? "right" : "left";
    setExpanded({ [side]: region, [otherSide]: null } as ExpandedState);
  }, []);

  // Navigation handlers
  const handleBack = () => {
    if (isFirstStep) {
      onBack?.();
    } else {
      setIncompleteRegions([]);
      setExpanded({ left: null, right: null });
      onStepChange?.(currentStepIndex - 1);
    }
  };

  const performSkip = () => {
    setIncompleteRegions([]);
    setExpanded({ left: null, right: null });
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

  // Set all unanswered pain questions to "no"
  const handleNoMorePainRegions = () => {
    const painInstances = stepInstances.filter((i) => i.context.painType === "pain");
    for (const inst of painInstances) {
      const currentValue = form.getValues(inst.path as FieldPath<FormValues>);
      if (currentValue == null) {
        setInstanceValue(form.setValue, inst.path, "no");
      }
    }
    setIncompleteRegions([]);
    setExpanded({ left: null, right: null });
  };

  const handleNext = () => {
    // Intro step has no form data - just complete and advance
    if (currentStepId === "e5-intro") {
      setStepStatuses((prev) => ({ ...prev, "e5-intro": "completed" }));
      onStepChange?.(currentStepIndex + 1);
      return;
    }

    // Check for refusal first
    const refusedInst = stepInstances.find((i) =>
      isInterview ? i.path.endsWith(".interviewRefused") : i.path.endsWith(".refused")
    );
    const isStepRefused = refusedInst
      ? (form.getValues(refusedInst.path as FieldPath<FormValues>) as unknown as boolean) === true
      : false;

    if (isStepRefused) {
      setExpanded({ left: null, right: null });
      setIncompleteRegions([]);

      // If a measurement step is refused, auto-refuse the following interview step
      const nextStepId = E5_STEP_ORDER[currentStepIndex + 1];
      const isMeasureWithInterview = !isInterview && nextStepId && isInterviewStep(String(nextStepId));

      if (isMeasureWithInterview && refusedInst) {
        // Set interviewRefused = true in form data
        const interviewRefusedPath = refusedInst.path.replace(".refused", ".interviewRefused");
        form.setValue(interviewRefusedPath as FieldPath<FormValues>, true as never);
        // Clear all interview pain data
        const interviewInstances = getInstancesForStep(nextStepId as ExaminationStepId);
        for (const inst of interviewInstances) {
          if (!inst.path.endsWith(".interviewRefused")) {
            setInstanceValue(form.setValue, inst.path, null);
          }
        }
        // Mark both current and next step as refused, skip over interview
        setStepStatuses((prev) => ({
          ...prev,
          [currentStepId]: "refused",
          [nextStepId]: "refused",
        }));
        const skipToIndex = currentStepIndex + 2;
        if (skipToIndex >= E5_STEP_ORDER.length) {
          onComplete?.();
        } else {
          onStepChange?.(skipToIndex);
        }
      } else {
        setStepStatuses((prev) => ({ ...prev, [currentStepId]: "refused" }));
        if (isLastStep) {
          onComplete?.();
        } else {
          onStepChange?.(currentStepIndex + 1);
        }
      }
      return;
    }

    // If measurement step proceeds normally, clear any previously auto-refused interview
    if (!isInterview) {
      const nextStepId = E5_STEP_ORDER[currentStepIndex + 1];
      if (nextStepId && isInterviewStep(String(nextStepId)) && stepStatuses[nextStepId] === "refused") {
        const measRefusedInst = stepInstances.find((i) => i.path.endsWith(".refused"));
        if (measRefusedInst) {
          const interviewRefusedPath = measRefusedInst.path.replace(".refused", ".interviewRefused");
          form.setValue(interviewRefusedPath as FieldPath<FormValues>, false as never);
        }
        setStepStatuses((prev) => {
          const next = { ...prev };
          delete next[nextStepId];
          return next;
        });
      }
    }

    // For interview steps, validate completeness first
    if (isInterview) {
      const result = validateInterviewCompletion(stepInstances, (path) =>
        form.getValues(path as FieldPath<FormValues>)
      );
      if (!result.valid) {
        setIncompleteRegions(result.incompleteRegions);
        setShowSkipDialog(true);
        return;
      }
      setIncompleteRegions([]);
    }

    const isValid = validateStep(currentStepId as ExaminationStepId);
    if (!isValid) {
      setShowSkipDialog(true);
      return;
    }

    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "completed" }));
    setExpanded({ left: null, right: null });

    if (isLastStep) {
      onComplete?.();
    } else {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  const getStepStatus = (stepId: E5StepId, index: number): StepStatus => {
    if (allComplete) {
      const status = stepStatuses[stepId];
      if (status === "refused") return "completed";
      return status || "pending";
    }
    if (index === currentStepIndex) return "active";
    const status = stepStatuses[stepId];
    if (status === "refused") return "completed";
    if (status) return status;
    return "pending";
  };

  // Get summary for a step (for collapsed display)
  const getStepSummary = (stepId: E5StepId): string => {
    if (stepId === "e5-intro") return "";
    const instances = getInstancesForStep(stepId as ExaminationStepId);
    const stepIsInterview = isInterviewStep(String(stepId));

    // Check for refused status first
    if (stepStatuses[stepId] === "refused") {
      return COMMON.refused;
    }

    if (stepIsInterview) {
      // Check for interview refusal
      const interviewRefusedInst = instances.find((i) => i.path.endsWith(".interviewRefused"));
      if (interviewRefusedInst) {
        const isRefused = form.getValues(interviewRefusedInst.path as FieldPath<FormValues>) as unknown as boolean;
        if (isRefused === true) {
          return COMMON.refused;
        }
      }

      // Check pain and familiar pain values across all regions
      let hasPain = false;
      let hasFamiliarPain = false;
      let hasFamiliarHeadache = false;

      for (const inst of instances) {
        const value = form.getValues(inst.path as FieldPath<FormValues>) as unknown as string | null;
        if (inst.context.painType === "pain" && value === "yes") {
          hasPain = true;
        }
        if (inst.context.painType === "familiarPain" && value === "yes") {
          hasFamiliarPain = true;
        }
        if (inst.context.painType === "familiarHeadache" && value === "yes") {
          hasFamiliarHeadache = true;
        }
      }

      if (!hasPain) {
        return "Kein Schmerz";
      }
      if (hasFamiliarPain && hasFamiliarHeadache) {
        return "Bek. Schmerz + Kopfschmerz";
      }
      if (hasFamiliarPain) {
        return "Bekannter Schmerz";
      }
      if (hasFamiliarHeadache) {
        return "Bekannter Kopfschmerz";
      }
      return "Keine Übereinstimmung";
    }

    // Check for measurement refusal
    const refusedInst = instances.find((i) => i.path.endsWith(".refused"));
    if (refusedInst) {
      const isRefused = form.getValues(refusedInst.path as FieldPath<FormValues>) as unknown as boolean;
      if (isRefused === true) {
        return COMMON.refused;
      }
    }

    // Measurement step - show value
    const measurementInst = instances.find((i) => i.renderType === "measurement");
    if (measurementInst) {
      const value = form.getValues(measurementInst.path as keyof typeof form.getValues);
      if (value != null && value !== "") {
        return `${value} mm`;
      }
    }
    return "—";
  };

  // Render instruction block based on step type
  const renderInstruction = (stepId: string, stepIsInterview: boolean) => {
    if (stepId === "e5-intro") {
      return <MeasurementFlowBlock instruction={E5_RICH_INSTRUCTIONS.introduction} />;
    }

    if (stepIsInterview) {
      return <PainInterviewBlock instruction={E5_RICH_INSTRUCTIONS.painInterview} showFlow={true} />;
    }

    if (stepId === "e5a-measure") {
      return <MeasurementFlowBlock instruction={E5_RICH_INSTRUCTIONS.lateralRightMeasurement} />;
    }

    if (stepId === "e5b-measure") {
      return <MeasurementFlowBlock instruction={E5_RICH_INSTRUCTIONS.lateralLeftMeasurement} />;
    }

    if (stepId === "e5c-measure") {
      return <MeasurementFlowBlock instruction={E5_RICH_INSTRUCTIONS.protrusiveMeasurement} />;
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getSectionCardTitle(SECTIONS.e5)}</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="alle-regionen-header-e5"
                checked={includeAllRegions}
                onCheckedChange={(checked) => setIncludeAllRegions(checked === true)}
              />
              <Label
                htmlFor="alle-regionen-header-e5"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Alle Regionen
              </Label>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/protocol/$section" params={{ section: "e5" }}>
                <BookOpen className="h-4 w-4 mr-1" />
                Protokoll
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {E5_STEP_ORDER.map((stepId, index) => {
          const config = E5_STEP_CONFIG[stepId];
          const status = getStepStatus(stepId, index);

          if (status === "active") {
            const stepIsInterview = isInterviewStep(String(stepId));

            return (
              <div
                key={stepId}
                ref={activeStepRef}
                className="scroll-mt-16 xl:scroll-mt-0 rounded-lg border border-primary/30 bg-card p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <Badge>{config.badge}</Badge>
                  <h3 className="font-semibold">{config.title}</h3>
                </div>

                {/* Instruction */}
                {renderInstruction(stepId, stepIsInterview)}

                {/* Content (intro step has no form content) */}
                {stepId === "e5-intro" ? null : stepIsInterview ? (
                  <InterviewContent
                    stepInstances={stepInstances}
                    regions={regions}
                    expanded={expanded}
                    onExpandChange={handleExpandChange}
                    incompleteRegions={incompleteRegions}
                    onNoMorePainRegions={handleNoMorePainRegions}
                    onClearIncompleteRegions={() => setIncompleteRegions([])}
                  />
                ) : (
                  <MeasurementStep instances={stepInstances} />
                )}

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
              summary={status === "pending" ? "—" : getStepSummary(stepId)}
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
