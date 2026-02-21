import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldPath } from "react-hook-form";
import { E4_RICH_INSTRUCTIONS } from "../../content/instructions";
import { setInstanceValue } from "../../form/form-helpers";
import {
  useExaminationForm,
  type ExaminationStepId,
  type FormValues,
} from "../../form/use-examination-form";
import { validateInterviewCompletion, type IncompleteRegion } from "../../form/validation";
import { useScrollToActiveStep } from "../../hooks/use-scroll-to-active-step";
import { COMMON, getSectionCardTitle } from "../../labels";
import { ALL_REGIONS, BASE_REGIONS, type Region, type Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import {
  IntroPanel,
  MeasurementFlowBlock,
  MeasurementStep,
  PainInterviewBlock,
  SectionFooter,
  StepBar,
  type StepStatus,
} from "../ui";
import { SectionCommentButton } from "../ui/SectionCommentButton";
import { E4AMeasurementContent } from "./e4/E4AMeasurementContent";
import { InterviewContent } from "./e4/InterviewContent";
import type { ExpandedState } from "./e4/types";
import type { SectionProps } from "./types";

// Step configuration
type E4StepId = ExaminationStepId;

// 3 combined steps: measurement + interview shown together on one screen
const E4_STEP_ORDER: E4StepId[] = ["e4a", "e4b-measure", "e4c-measure"];

const E4_STEP_CONFIG: Record<string, { badge: string; title: string }> = {
  e4a: { badge: "U4A", title: "Schmerzfreie Mundöffnung" },
  "e4b-measure": { badge: "U4B", title: "Maximale aktive Mundöffnung" },
  "e4c-measure": { badge: "U4C", title: "Maximale passive Mundöffnung" },
};

// Maps each measurement step to its paired interview step (stored in form data)
const MEASURE_TO_INTERVIEW: Partial<Record<string, ExaminationStepId>> = {
  "e4b-measure": "e4b-interview",
  "e4c-measure": "e4c-interview",
};

interface E4SectionProps extends SectionProps {
  step?: number; // 1-indexed from URL, undefined = auto-detect
  onStepChange?: (stepIndex: number | null) => void; // 0-indexed, null = summary
}

/**
 * Compute step completion status from form values.
 * For combined steps (e4b-measure, e4c-measure): requires both measurement
 * AND interview to be complete (or measurement refused).
 * interviewInstances should be passed for combined steps.
 */
function computeStepStatusFromForm(
  stepId: E4StepId,
  instances: QuestionInstance[],
  getValue: (path: string) => unknown,
  interviewInstances?: QuestionInstance[]
): "completed" | "refused" | "skipped" | null {
  // Measurement refusal takes priority over everything
  const refusedInst = instances.find((i) => i.path.endsWith(".refused"));
  if (refusedInst && getValue(refusedInst.path) === true) {
    return "refused";
  }

  if (stepId === "e4a") {
    // E4A is measurement-only: check if required field has a value
    for (const inst of instances) {
      const config = inst.config as { required?: boolean };
      if (config.required) {
        const value = getValue(inst.path);
        if (value != null && value !== "") {
          const skippedSteps = getValue("_skippedSteps") as string[] | undefined;
          if (skippedSteps?.includes(String(stepId))) return "skipped";
          return "completed";
        }
      }
    }
  } else {
    // Combined measurement + interview step
    const measurementInst = instances.find((i) => i.renderType === "measurement");
    if (measurementInst) {
      const value = getValue(measurementInst.path);
      const terminatedPath = measurementInst.path.replace(/\.[^.]+$/, ".terminated");
      const terminated = getValue(terminatedPath);
      const measurementDone = terminated === true || (value != null && value !== "");

      if (measurementDone && interviewInstances && interviewInstances.length > 0) {
        const result = validateInterviewCompletion(interviewInstances, getValue);
        if (result.valid) {
          const skippedSteps = getValue("_skippedSteps") as string[] | undefined;
          if (skippedSteps?.includes(String(stepId))) return "skipped";
          return "completed";
        }
        // Measurement done but interview incomplete → not complete yet
      }
    }
  }

  // Check if explicitly skipped (checked last so real data takes priority)
  const skippedSteps = getValue("_skippedSteps") as string[] | undefined;
  if (skippedSteps?.includes(String(stepId))) return "skipped";

  return null;
}

/** Derive interview summary text from interview instances */
function getInterviewSummaryText(
  instances: QuestionInstance[],
  getValue: (path: string) => unknown
): string {
  const interviewRefusedInst = instances.find((i) => i.path.endsWith(".interviewRefused"));
  if (interviewRefusedInst && getValue(interviewRefusedInst.path) === true) {
    return COMMON.refused;
  }

  let hasPain = false;
  let hasFamiliarPain = false;
  let hasFamiliarHeadache = false;

  for (const inst of instances) {
    const value = getValue(inst.path) as string | null;
    if (inst.context.painType === "pain" && value === "yes") hasPain = true;
    if (inst.context.painType === "familiarPain" && value === "yes") hasFamiliarPain = true;
    if (inst.context.painType === "familiarHeadache" && value === "yes") hasFamiliarHeadache = true;
  }

  if (!hasPain) return "Kein Schmerz";
  if (hasFamiliarPain && hasFamiliarHeadache) return "Bek. Schmerz + Kopfschmerz";
  if (hasFamiliarPain) return "Bekannter Schmerz";
  if (hasFamiliarHeadache) return "Bekannter Kopfschmerz";
  return "Keine Übereinstimmung";
}

export function E4Section({
  step,
  onStepChange,
  onComplete,
  onBack,
  isFirstSection,
}: E4SectionProps) {
  const { form, validateStep, getInstancesForStep } = useExaminationForm();
  const activeStepRef = useScrollToActiveStep(step ?? 0);

  // Keep stepStatuses in state (computed from form on mount)
  const [stepStatuses, setStepStatuses] = useState<
    Record<string, "completed" | "skipped" | "refused">
  >(() => {
    const statuses: Record<string, "completed" | "skipped" | "refused"> = {};
    for (const stepId of E4_STEP_ORDER) {
      const instances = getInstancesForStep(stepId);
      const pairedInterviewId = MEASURE_TO_INTERVIEW[stepId as string];
      const iInstances = pairedInterviewId ? getInstancesForStep(pairedInterviewId) : undefined;
      const status = computeStepStatusFromForm(
        stepId,
        instances,
        (path) => form.getValues(path as FieldPath<FormValues>),
        iInstances
      );
      if (status) statuses[stepId] = status;
    }
    return statuses;
  });
  const [incompleteRegions, setIncompleteRegions] = useState<IncompleteRegion[]>([]);
  const [includeAllRegions, setIncludeAllRegions] = useState(false);

  // Track expanded dropdowns for interview content
  const [expanded, setExpanded] = useState<ExpandedState>({ left: null, right: null });

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

  // Paired interview step info for the current combined step
  const pairedInterviewId = allComplete
    ? undefined
    : (MEASURE_TO_INTERVIEW[String(currentStepId)] as ExaminationStepId | undefined);
  const hasPairedInterview = pairedInterviewId !== undefined;

  const stepInstances = allComplete ? [] : getInstancesForStep(currentStepId);
  const interviewInstances = pairedInterviewId ? getInstancesForStep(pairedInterviewId) : [];

  // Subscribe to both measurement and interview fields for reactive updates
  form.watch(stepInstances.map((i) => i.path));
  form.watch(interviewInstances.map((i) => i.path));

  // Reactively compute whether measurement is refused (controls interview section visibility)
  const measureRefusedInst = stepInstances.find((i) => i.path.endsWith(".refused"));
  const isMeasurementRefused = measureRefusedInst
    ? (form.getValues(measureRefusedInst.path as FieldPath<FormValues>) as unknown as boolean) ===
      true
    : false;

  const currentStepStatus = allComplete
    ? null
    : computeStepStatusFromForm(
        currentStepId,
        stepInstances,
        (path) => form.getValues(path as FieldPath<FormValues>),
        interviewInstances.length > 0 ? interviewInstances : undefined
      );
  const isCurrentStepComplete =
    currentStepStatus === "completed" || currentStepStatus === "refused";

  const sectionIsDone = E4_STEP_ORDER.every((stepId) => {
    if (stepStatuses[stepId]) return true;
    const instances = getInstancesForStep(stepId);
    const pId = MEASURE_TO_INTERVIEW[stepId as string];
    const iInsts = pId ? getInstancesForStep(pId) : undefined;
    const status = computeStepStatusFromForm(
      stepId,
      instances,
      (path) => form.getValues(path as FieldPath<FormValues>),
      iInsts
    );
    return status === "completed" || status === "refused";
  });

  // Reactively clear incomplete regions when interview answers change
  useEffect(() => {
    if (incompleteRegions.length === 0) return;
    if (currentStepIndex < 0 || currentStepIndex >= E4_STEP_ORDER.length) return;
    const stepId = E4_STEP_ORDER[currentStepIndex];
    const interviewId = MEASURE_TO_INTERVIEW[stepId as string];
    if (!interviewId) return; // No paired interview (e4a)

    const subscription = form.watch(() => {
      const iInstances = getInstancesForStep(interviewId);
      const result = validateInterviewCompletion(iInstances, (path) =>
        form.getValues(path as FieldPath<FormValues>)
      );
      setIncompleteRegions(result.incompleteRegions);
    });

    return () => subscription.unsubscribe();
  }, [currentStepIndex, incompleteRegions.length, form, getInstancesForStep]);

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

  const handleSectionSkip = () => {
    const stepsToSkip = E4_STEP_ORDER.filter((stepId) => !stepStatuses[stepId]);
    if (stepsToSkip.length > 0) {
      // Also skip paired interview step IDs for data consistency
      const allStepsToSkip = stepsToSkip.flatMap((stepId) => {
        const pairedId = MEASURE_TO_INTERVIEW[stepId as string];
        return pairedId ? [stepId, pairedId] : [stepId];
      });
      const currentSkipped = form.getValues("_skippedSteps") ?? [];
      form.setValue("_skippedSteps", [...currentSkipped, ...allStepsToSkip]);
      setStepStatuses((prev) => {
        const next = { ...prev };
        for (const stepId of stepsToSkip) next[stepId] = "skipped";
        return next;
      });
    }
    onComplete?.();
  };

  const performSkip = () => {
    setIncompleteRegions([]);
    setExpanded({ left: null, right: null });

    // Skip both measurement and paired interview step IDs for data consistency
    const pairedId = MEASURE_TO_INTERVIEW[String(currentStepId)];
    const stepsToMarkSkipped = pairedId
      ? [String(currentStepId), String(pairedId)]
      : [String(currentStepId)];

    const currentSkipped = form.getValues("_skippedSteps") ?? [];
    form.setValue("_skippedSteps", [...currentSkipped, ...stepsToMarkSkipped]);
    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "skipped" }));

    if (isLastStep) {
      onStepChange?.(null);
    } else {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  // Set all unanswered pain questions to "no"
  const handleNoMorePainRegions = () => {
    const painInstances = interviewInstances.filter((i) => i.context.painType === "pain");
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
    // Check for measurement refusal first
    const refusedInst = stepInstances.find((i) => i.path.endsWith(".refused"));
    const isStepRefused = refusedInst
      ? (form.getValues(refusedInst.path as FieldPath<FormValues>) as unknown as boolean) === true
      : false;

    if (isStepRefused) {
      setExpanded({ left: null, right: null });
      setIncompleteRegions([]);

      // Auto-refuse the paired interview: set interviewRefused and clear interview data
      if (hasPairedInterview && refusedInst) {
        const interviewRefusedPath = refusedInst.path.replace(".refused", ".interviewRefused");
        form.setValue(interviewRefusedPath as FieldPath<FormValues>, true as never);
        for (const inst of interviewInstances) {
          if (!inst.path.endsWith(".interviewRefused")) {
            setInstanceValue(form.setValue, inst.path, null);
          }
        }
      }

      setStepStatuses((prev) => ({ ...prev, [currentStepId]: "refused" }));
      if (isLastStep) {
        onStepChange?.(null);
      } else {
        onStepChange?.(currentStepIndex + 1);
      }
      return;
    }

    // Validate measurement fields
    const isValid = validateStep(currentStepId as ExaminationStepId);
    if (!isValid) return;

    // For combined steps, also validate interview (when measurement is not refused)
    if (hasPairedInterview && !isMeasurementRefused) {
      const result = validateInterviewCompletion(interviewInstances, (path) =>
        form.getValues(path as FieldPath<FormValues>)
      );
      if (!result.valid) {
        setIncompleteRegions(result.incompleteRegions);
        return;
      }
      setIncompleteRegions([]);
    }

    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "completed" }));
    setExpanded({ left: null, right: null });

    if (isLastStep) {
      onStepChange?.(null);
    } else {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  const getStepStatus = (stepId: E4StepId, index: number): StepStatus => {
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

  // Get summary for a step (for collapsed StepBar display)
  const getStepSummary = (stepId: E4StepId): string => {
    const instances = getInstancesForStep(stepId);

    if (stepStatuses[stepId] === "refused") return COMMON.refused;

    // Check for measurement refusal in form data
    const refusedInst = instances.find((i) => i.path.endsWith(".refused"));
    if (refusedInst) {
      const isRefused = form.getValues(
        refusedInst.path as FieldPath<FormValues>
      ) as unknown as boolean;
      if (isRefused === true) return COMMON.refused;
    }

    // Measurement value
    const measurementInst = instances.find((i) => i.renderType === "measurement");
    if (measurementInst) {
      const value = form.getValues(measurementInst.path as keyof typeof form.getValues);
      if (value != null && value !== "") {
        // Combined step: append interview summary
        const pairedId = MEASURE_TO_INTERVIEW[String(stepId)];
        if (pairedId) {
          const iInstances = getInstancesForStep(pairedId);
          const interviewSummary = getInterviewSummaryText(iInstances, (path) =>
            form.getValues(path as FieldPath<FormValues>)
          );
          return `${value} mm · ${interviewSummary}`;
        }
        return `${value} mm`;
      }
    }

    // E4A: check required field value
    if (stepId === "e4a") {
      for (const inst of instances) {
        const config = inst.config as { required?: boolean };
        if (config.required) {
          const value = form.getValues(inst.path as FieldPath<FormValues>);
          if (value != null && value !== "") return String(value);
        }
      }
    }

    return "—";
  };

  // Render measurement instruction block
  const renderMeasurementInstruction = (stepId: string) => {
    if (stepId === "e4a") {
      return (
        <IntroPanel title="Anweisungen">
          <MeasurementFlowBlock instruction={E4_RICH_INSTRUCTIONS.painFreeOpening} />
        </IntroPanel>
      );
    }

    if (stepId === "e4b-measure") {
      return (
        <IntroPanel title="Anweisungen">
          <MeasurementFlowBlock instruction={E4_RICH_INSTRUCTIONS.maxUnassistedOpening} />
        </IntroPanel>
      );
    }

    if (stepId === "e4c-measure") {
      const warnings = E4_RICH_INSTRUCTIONS.maxAssistedOpening.warnings;
      return (
        <>
          {warnings && warnings.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              {warnings.map((warning, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <span>{warning.message}</span>
                </div>
              ))}
            </div>
          )}
          <IntroPanel title="Anweisungen">
            <MeasurementFlowBlock
              instruction={{ ...E4_RICH_INSTRUCTIONS.maxAssistedOpening, warnings: undefined }}
            />
          </IntroPanel>
        </>
      );
    }

    return null;
  };

  // Render interview instruction block (keyed on interview step ID)
  const renderInterviewInstruction = (interviewStepId: string) => {
    const interviewInstruction =
      interviewStepId === "e4c-interview"
        ? E4_RICH_INSTRUCTIONS.painInterviewAssistedOpening
        : E4_RICH_INSTRUCTIONS.painInterview;
    return (
      <IntroPanel title="Anweisungen">
        <PainInterviewBlock instruction={interviewInstruction} showFlow={true} />
      </IntroPanel>
    );
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
            <SectionCommentButton sectionId="e4" />
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
        <IntroPanel title="Einführung Öffnungsbewegungen">
          <MeasurementFlowBlock instruction={E4_RICH_INSTRUCTIONS.introduction} />
        </IntroPanel>
        {E4_STEP_ORDER.map((stepId, index) => {
          const config = E4_STEP_CONFIG[stepId];
          const status = getStepStatus(stepId, index);

          if (status === "active") {
            const stepPairedInterviewId = MEASURE_TO_INTERVIEW[String(stepId)];
            const stepInterviewInstances = stepPairedInterviewId
              ? getInstancesForStep(stepPairedInterviewId)
              : [];

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

                {/* Measurement instruction */}
                {renderMeasurementInstruction(stepId)}

                {/* Measurement content */}
                {stepId === "e4a" ? (
                  <E4AMeasurementContent stepInstances={stepInstances} />
                ) : (
                  <MeasurementStep instances={stepInstances} />
                )}

                {/* Interview section — only for combined steps, hidden when measurement refused */}
                {stepPairedInterviewId && !isMeasurementRefused && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{config.badge}</Badge>
                        <h4 className="font-medium text-sm">Schmerzbefragung</h4>
                      </div>
                    </div>
                    {renderInterviewInstruction(stepPairedInterviewId)}
                    <InterviewContent
                      stepInstances={stepInterviewInstances}
                      regions={regions}
                      expanded={expanded}
                      onExpandChange={handleExpandChange}
                      incompleteRegions={incompleteRegions}
                      onNoMorePainRegions={handleNoMorePainRegions}
                      onClearIncompleteRegions={() => setIncompleteRegions([])}
                    />
                  </>
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

                  <div className="flex items-center gap-2">
                    {!isCurrentStepComplete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={performSkip}
                        className="text-muted-foreground text-xs"
                      >
                        Schritt überspringen
                      </Button>
                    )}
                    <Button type="button" onClick={handleNext}>
                      {isLastStep ? "Abschließen" : "Weiter"}
                    </Button>
                  </div>
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
      </CardContent>

      {/* Section-level footer */}
      {allComplete || sectionIsDone ? (
        <SectionFooter onNext={onComplete} onBack={onBack} isFirstStep={isFirstSection} />
      ) : (
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSectionSkip}
            className="text-muted-foreground text-xs"
          >
            Abschnitt überspringen
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
