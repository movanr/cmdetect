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
import { E4_RICH_INSTRUCTIONS } from "../../content/instructions";
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
import { E4AMeasurementContent } from "./e4/E4AMeasurementContent";
import { InterviewContent } from "./e4/InterviewContent";
import type { ExpandedState } from "./e4/types";
import type { SectionProps } from "./types";

// Step configuration
type E4StepId = "e4-intro" | ExaminationStepId;

const E4_STEP_ORDER: E4StepId[] = [
  "e4-intro",
  "e4a",
  "e4b-measure",
  "e4b-interview",
  "e4c-measure",
  "e4c-interview",
];

const E4_STEP_CONFIG: Record<string, { badge: string; title: string }> = {
  "e4-intro": { badge: "U4", title: "Einführung Öffnungsbewegungen" },
  e4a: { badge: "U4A", title: "Schmerzfreie Mundöffnung" },
  "e4b-measure": { badge: "U4B", title: "Maximale aktive Mundöffnung" },
  "e4b-interview": { badge: "U4B", title: "Schmerzbefragung" },
  "e4c-measure": { badge: "U4C", title: "Maximale passive Mundöffnung" },
  "e4c-interview": { badge: "U4C", title: "Schmerzbefragung" },
};

const isInterviewStep = (id: string) => id.endsWith("-interview");

interface E4SectionProps extends SectionProps {
  step?: number; // 1-indexed from URL, undefined = auto-detect
  onStepChange?: (stepIndex: number | null) => void; // 0-indexed, null = summary
}

/**
 * Compute step completion status from form values.
 * Returns "completed" if the step has valid data, "refused" if refused, null otherwise.
 */
function computeStepStatusFromForm(
  stepId: E4StepId,
  instances: QuestionInstance[],
  getValue: (path: string) => unknown
): "completed" | "refused" | null {
  if (stepId === "e4-intro") return null;
  const isInterview = isInterviewStep(String(stepId));

  if (isInterview) {
    // Check for interview refusal first
    const interviewRefusedInst = instances.find((i) => i.path.endsWith(".interviewRefused"));
    if (interviewRefusedInst && getValue(interviewRefusedInst.path) === true) {
      return "refused";
    }
    // Check if all pain questions are answered (validates interview completion)
    const result = validateInterviewCompletion(instances, getValue);
    return result.valid ? "completed" : null;
  }

  // Measurement step - check for refusal first
  const refusedInst = instances.find((i) => i.path.endsWith(".refused"));
  if (refusedInst && getValue(refusedInst.path) === true) {
    return "refused";
  }

  // Check if measurement field has value or terminated
  const measurementInst = instances.find((i) => i.renderType === "measurement");
  if (measurementInst) {
    const value = getValue(measurementInst.path);
    const terminatedPath = measurementInst.path.replace(/\.[^.]+$/, ".terminated");
    const terminated = getValue(terminatedPath);
    if (terminated === true || (value != null && value !== "")) {
      return "completed";
    }
  }

  // For E4A which uses QuestionField directly (not MeasurementStep)
  if (stepId === "e4a") {
    for (const inst of instances) {
      const config = inst.config as { required?: boolean };
      if (config.required) {
        const value = getValue(inst.path);
        if (value != null && value !== "") {
          return "completed";
        }
      }
    }
  }

  return null;
}

export function E4Section({ step, onStepChange, onComplete, onBack, isFirstSection }: E4SectionProps) {
  const { form, validateStep, getInstancesForStep } = useExaminationForm();

  // Keep stepStatuses in state (computed from form on mount)
  const [stepStatuses, setStepStatuses] = useState<Record<string, "completed" | "skipped" | "refused">>(() => {
    const statuses: Record<string, "completed" | "skipped" | "refused"> = {};
    for (const stepId of E4_STEP_ORDER) {
      if (stepId === "e4-intro") continue; // Intro has no form data
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
      if (index >= 0 && index < E4_STEP_ORDER.length) {
        return index;
      }
    }
    // Auto-detect: find first incomplete step
    for (let i = 0; i < E4_STEP_ORDER.length; i++) {
      if (!stepStatuses[E4_STEP_ORDER[i]]) return i;
    }
    return -1; // All complete
  }, [step, stepStatuses]);

  // -1 means all steps are complete
  const allComplete = currentStepIndex === -1;
  const currentStepId = allComplete ? E4_STEP_ORDER[0] : E4_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E4_STEP_ORDER.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const isInterview = isInterviewStep(String(currentStepId));
  const stepInstances = allComplete || currentStepId === "e4-intro" ? [] : getInstancesForStep(currentStepId as ExaminationStepId);

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
      // On first internal step, go back to previous section
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
    // Clear any validation errors since we've filled in the missing values
    setIncompleteRegions([]);
    // Reset expanded state
    setExpanded({ left: null, right: null });
  };

  const handleNext = () => {
    // Intro step has no form data - just complete and advance
    if (currentStepId === "e4-intro") {
      setStepStatuses((prev) => ({ ...prev, "e4-intro": "completed" }));
      onStepChange?.(currentStepIndex + 1);
      return;
    }

    // Check for refusal first - if refused, mark as refused and proceed
    const refusedInst = stepInstances.find((i) =>
      isInterview ? i.path.endsWith(".interviewRefused") : i.path.endsWith(".refused")
    );
    const isStepRefused = refusedInst
      ? (form.getValues(refusedInst.path as FieldPath<FormValues>) as unknown as boolean) === true
      : false;

    if (isStepRefused) {
      setStepStatuses((prev) => ({ ...prev, [currentStepId]: "refused" }));
      setExpanded({ left: null, right: null });
      setIncompleteRegions([]);

      if (isLastStep) {
        onComplete?.();
      } else {
        onStepChange?.(currentStepIndex + 1);
      }
      return;
    }

    // For interview steps, validate completeness first
    if (isInterview) {
      const result = validateInterviewCompletion(stepInstances, (path) =>
        form.getValues(path as FieldPath<FormValues>)
      );
      if (!result.valid) {
        setIncompleteRegions(result.incompleteRegions);
        // Show skip dialog when validation fails
        setShowSkipDialog(true);
        return;
      }
      setIncompleteRegions([]);
    }

    const isValid = validateStep(currentStepId as ExaminationStepId);
    if (!isValid) {
      // Show skip dialog when validation fails
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

  const getStepStatus = (stepId: E4StepId, index: number): StepStatus => {
    // -1 means all complete, no active step
    if (allComplete) {
      const status = stepStatuses[stepId];
      // Map "refused" to "completed" for StepBar display (will show RF badge via summary)
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
  const getStepSummary = (stepId: E4StepId): string => {
    if (stepId === "e4-intro") return "";
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
      // Pain reported but no familiar pain/headache
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
    // E4 intro - overview of opening movements and pain interview
    if (stepId === "e4-intro") {
      return <MeasurementFlowBlock instruction={E4_RICH_INSTRUCTIONS.introduction} />;
    }

    // Pain interview - use appropriate interview flow based on step
    if (stepIsInterview) {
      // E4C uses different pain question (asks about examiner manipulation)
      const interviewInstruction =
        stepId === "e4c-interview"
          ? E4_RICH_INSTRUCTIONS.painInterviewAssistedOpening
          : E4_RICH_INSTRUCTIONS.painInterview;
      return <PainInterviewBlock instruction={interviewInstruction} showFlow={true} />;
    }

    // E4A - pain-free opening measurement (step-based flow)
    if (stepId === "e4a") {
      return <MeasurementFlowBlock instruction={E4_RICH_INSTRUCTIONS.painFreeOpening} />;
    }

    // E4B measurement - step-based flow
    if (stepId === "e4b-measure") {
      return <MeasurementFlowBlock instruction={E4_RICH_INSTRUCTIONS.maxUnassistedOpening} />;
    }

    // E4C measurement - step-based flow with safety warning
    if (stepId === "e4c-measure") {
      return <MeasurementFlowBlock instruction={E4_RICH_INSTRUCTIONS.maxAssistedOpening} />;
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getSectionCardTitle(SECTIONS.e4)}</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="alle-regionen-header"
                checked={includeAllRegions}
                onCheckedChange={(checked) => setIncludeAllRegions(checked === true)}
              />
              <Label
                htmlFor="alle-regionen-header"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Alle Regionen
              </Label>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/protocol/$section" params={{ section: "e4" }}>
                <BookOpen className="h-4 w-4 mr-1" />
                Protokoll
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {E4_STEP_ORDER.map((stepId, index) => {
          const config = E4_STEP_CONFIG[stepId];
          const status = getStepStatus(stepId, index);

          if (status === "active") {
            const stepIsInterview = isInterviewStep(String(stepId));

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

                {/* Instruction */}
                {renderInstruction(stepId, stepIsInterview)}

                {/* Content (intro step has no form content) */}
                {stepId === "e4-intro" ? null : stepIsInterview ? (
                  <InterviewContent
                    stepInstances={stepInstances}
                    regions={regions}
                    expanded={expanded}
                    onExpandChange={handleExpandChange}
                    incompleteRegions={incompleteRegions}
                    onNoMorePainRegions={handleNoMorePainRegions}
                    onClearIncompleteRegions={() => setIncompleteRegions([])}
                  />
                ) : stepId === "e4a" ? (
                  // E4A uses QuestionField directly for the pain-free opening measurement
                  <E4AMeasurementContent stepInstances={stepInstances} />
                ) : (
                  <MeasurementStep instances={stepInstances} />
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  {/* Left: Back button */}
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

                  {/* Right: Next button */}
                  <Button type="button" onClick={handleNext}>
                    {isLastStep ? "Abschließen" : "Weiter"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            );
          }

          // Collapsed step - using StepBar component
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
