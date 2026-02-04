import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";
import { useCallback, useState } from "react";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { E4_RICH_INSTRUCTIONS } from "../../content/instructions";
import {
  useExaminationForm,
  type ExaminationStepId,
  type FormValues,
} from "../../form/use-examination-form";
import { validateInterviewCompletion, type IncompleteRegion } from "../../form/validation";
import { COMMON, getLabel, getSectionCardTitle } from "../../labels";
import { ALL_REGIONS, BASE_REGIONS, type Region, type Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { HeadDiagram } from "../HeadDiagram/head-diagram";
import { type RegionStatus } from "../HeadDiagram/types";
import { RefusalCheckbox } from "../inputs/RefusalCheckbox";
import { QuestionField } from "../QuestionField";
import { RegionDropdown } from "../RegionDropdown";
import {
  MeasurementFlowBlock,
  MeasurementStep,
  PainInterviewBlock,
  SectionFooter,
  StepBar,
  type StepStatus,
} from "../ui";

// Step configuration
const E4_STEP_ORDER: ExaminationStepId[] = [
  "e4a",
  "e4b-measure",
  "e4b-interview",
  "e4c-measure",
  "e4c-interview",
];

const E4_STEP_CONFIG: Record<string, { badge: string; title: string }> = {
  e4a: { badge: "U4A", title: "Schmerzfreie Mundöffnung" },
  "e4b-measure": { badge: "U4B", title: "Maximale aktive Mundöffnung" },
  "e4b-interview": { badge: "U4B", title: "Schmerzbefragung" },
  "e4c-measure": { badge: "U4C", title: "Maximale passive Mundöffnung" },
  "e4c-interview": { badge: "U4C", title: "Schmerzbefragung" },
};

interface E4SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isFirstSection?: boolean;
}

/** Expanded region state per side */
type ExpandedState = { left: Region | null; right: Region | null };

/**
 * Compute step completion status from form values.
 * Returns "completed" if the step has valid data, "refused" if refused, null otherwise.
 */
function computeStepStatusFromForm(
  stepId: ExaminationStepId,
  instances: QuestionInstance[],
  getValue: (path: string) => unknown
): "completed" | "refused" | null {
  const isInterview = String(stepId).endsWith("-interview");

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

/**
 * Compute RegionStatus for a single region/side from form values.
 */
function computeRegionStatus(
  region: Region,
  side: Side,
  instances: QuestionInstance[],
  getValue: (path: string) => unknown
): RegionStatus {
  const regionInstances = instances.filter(
    (i) => i.context.region === region && i.context.side === side
  );

  const painInst = regionInstances.find((i) => i.context.painType === "pain");
  const familiarPainInst = regionInstances.find((i) => i.context.painType === "familiarPain");
  const familiarHeadacheInst = regionInstances.find(
    (i) => i.context.painType === "familiarHeadache"
  );

  const painValue = painInst ? (getValue(painInst.path) as string | null) : null;
  const familiarPainValue = familiarPainInst
    ? (getValue(familiarPainInst.path) as string | null)
    : null;
  const familiarHeadacheValue = familiarHeadacheInst
    ? (getValue(familiarHeadacheInst.path) as string | null)
    : null;

  const hasData = painValue != null;
  const isPainPositive = painValue === "yes";
  const hasFamiliarPainData = familiarPainValue != null;
  const hasFamiliarPain = familiarPainValue === "yes";
  const hasFamiliarHeadacheData = familiarHeadacheValue != null;
  const hasFamiliarHeadache = familiarHeadacheValue === "yes";

  // Complete if:
  // - pain = no, OR
  // - pain = yes AND familiarPain answered AND (no familiarHeadache question OR familiarHeadache answered)
  let isComplete = false;
  if (hasData) {
    if (!isPainPositive) {
      isComplete = true;
    } else {
      const hasFamiliarHeadacheQuestion = familiarHeadacheInst != null;
      isComplete = hasFamiliarPainData && (!hasFamiliarHeadacheQuestion || hasFamiliarHeadacheData);
    }
  }

  return {
    hasData,
    isPainPositive,
    hasFamiliarPainData,
    hasFamiliarPain,
    hasFamiliarHeadacheData,
    hasFamiliarHeadache,
    isComplete,
  };
}

/**
 * InterviewSubsection - HeadDiagram + RegionDropdowns for one subsection (E4B or E4C).
 */
interface InterviewSubsectionProps {
  instances: QuestionInstance[];
  regions: readonly Region[];
  expanded: ExpandedState;
  onExpandChange: (side: Side, region: Region | null) => void;
  incompleteRegions: IncompleteRegion[];
}

function InterviewSubsection({
  instances,
  regions,
  expanded,
  onExpandChange,
  incompleteRegions,
}: InterviewSubsectionProps) {
  const { getValues, watch } = useFormContext();

  // Watch all instance paths to trigger re-renders
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Compute region statuses for the diagram
  const computeStatuses = useCallback(
    (side: Side): Partial<Record<Region, RegionStatus>> => {
      const statuses: Partial<Record<Region, RegionStatus>> = {};
      for (const region of regions) {
        statuses[region] = computeRegionStatus(region, side, instances, getValues);
      }
      return statuses;
    },
    [regions, instances, getValues]
  );

  // Get instances for a specific region/side
  const getRegionInstances = useCallback(
    (region: Region, side: Side) =>
      instances.filter((i) => i.context.region === region && i.context.side === side),
    [instances]
  );

  // Get incomplete region for a specific region/side
  const getIncompleteRegion = useCallback(
    (region: Region, side: Side) =>
      incompleteRegions.find((r) => r.region === region && r.side === side),
    [incompleteRegions]
  );

  // Handle diagram region click - toggle dropdown
  const handleRegionClick = useCallback(
    (side: Side) => (region: Region) => {
      const currentExpanded = expanded[side];
      // Toggle: if same region, close; otherwise open clicked region
      onExpandChange(side, currentExpanded === region ? null : region);
    },
    [expanded, onExpandChange]
  );

  // Handle dropdown expansion change
  const handleDropdownExpand = useCallback(
    (side: Side, region: Region) => (isExpanded: boolean) => {
      onExpandChange(side, isExpanded ? region : null);
    },
    [onExpandChange]
  );

  // Filter incomplete regions by side
  const getIncompleteRegionsForSide = useCallback(
    (side: Side) => incompleteRegions.filter((r) => r.side === side),
    [incompleteRegions]
  );

  // Render a single side panel
  const renderSidePanel = (side: Side) => {
    const sideLabel = side === "right" ? "Rechte Seite" : "Linke Seite";
    const statuses = computeStatuses(side);
    const sideIncompleteRegions = getIncompleteRegionsForSide(side);

    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{sideLabel}</span>

        {/* HeadDiagram */}
        <HeadDiagram
          side={side}
          regions={regions}
          regionStatuses={statuses}
          selectedRegion={expanded[side]}
          onRegionClick={handleRegionClick(side)}
          incompleteRegions={sideIncompleteRegions}
        />

        {/* RegionDropdowns */}
        <div className="w-80 space-y-2">
          {regions.map((region) => (
            <RegionDropdown
              key={region}
              region={region}
              side={side}
              instances={getRegionInstances(region, side)}
              isExpanded={expanded[side] === region}
              onExpandChange={handleDropdownExpand(side, region)}
              incompleteRegion={getIncompleteRegion(region, side)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-start gap-8 md:gap-16">
      {renderSidePanel("right")}
      <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />
      {renderSidePanel("left")}
    </div>
  );
}

/**
 * InterviewContent - Wrapper for interview step with refusal checkbox.
 */
interface InterviewContentProps {
  stepInstances: QuestionInstance[];
  regions: readonly Region[];
  expanded: ExpandedState;
  onExpandChange: (side: Side, region: Region | null) => void;
  incompleteRegions: IncompleteRegion[];
  onNoMorePainRegions: () => void;
  onClearIncompleteRegions: () => void;
}

function InterviewContent({
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(inst.path as FieldPath<FormValues>, null as any);
            clearErrors(inst.path as FieldPath<FormValues>);
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

  return (
    <>
      <div className="flex justify-center pt-2">
        <Button type="button" variant="outline" onClick={onNoMorePainRegions}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Keine weiteren Schmerzbereiche
        </Button>
      </div>
      <InterviewSubsection
        instances={painInstances}
        regions={regions}
        expanded={expanded}
        onExpandChange={onExpandChange}
        incompleteRegions={incompleteRegions}
      />
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

/**
 * E4AMeasurementContent - E4A step content with refusal checkbox.
 */
interface E4AMeasurementContentProps {
  stepInstances: QuestionInstance[];
}

function E4AMeasurementContent({ stepInstances }: E4AMeasurementContentProps) {
  const { setValue, watch, clearErrors } = useFormContext<FormValues>();

  // Find measurement and refused instances
  const measurementInstance = stepInstances.find((i) => i.renderType === "measurement");
  const refusedInstance = stepInstances.find((i) => i.path.endsWith(".refused"));

  const watchedRefused = refusedInstance ? watch(refusedInstance.path as FieldPath<FormValues>) : undefined;
  const isRefused = (watchedRefused as unknown as boolean) === true;

  // Handle refused toggle - clear measurement value when refusing
  const handleRefuseChange = useCallback(
    (refused: boolean) => {
      if (refused && measurementInstance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(measurementInstance.path as FieldPath<FormValues>, null as any);
        clearErrors(measurementInstance.path as FieldPath<FormValues>);
      }
    },
    [measurementInstance, setValue, clearErrors]
  );

  return (
    <div className="space-y-4">
      {/* Measurement input - disabled when refused */}
      {measurementInstance && (
        <div className={isRefused ? "opacity-50 pointer-events-none" : ""}>
          <QuestionField
            instance={measurementInstance}
            label={getLabel(measurementInstance.labelKey)}
          />
          {isRefused && (
            <p className="text-sm text-muted-foreground mt-1">{COMMON.refused}</p>
          )}
        </div>
      )}

      {/* Refusal checkbox */}
      {refusedInstance && (
        <RefusalCheckbox<FormValues>
          name={refusedInstance.path as FieldPath<FormValues>}
          onRefuseChange={handleRefuseChange}
        />
      )}
    </div>
  );
}

export function E4Section({ onComplete, onBack, isFirstSection }: E4SectionProps) {
  const { form, validateStep, getInstancesForStep } = useExaminationForm();

  // Compute initial state from form values (persisted across tab switches)
  const [initialState] = useState(() => {
    const statuses: Record<string, "completed" | "skipped" | "refused"> = {};
    for (const stepId of E4_STEP_ORDER) {
      const instances = getInstancesForStep(stepId);
      const status = computeStepStatusFromForm(stepId, instances, (path) =>
        form.getValues(path as FieldPath<FormValues>)
      );
      if (status) statuses[stepId] = status;
    }

    // Find first incomplete step, or -1 if all complete
    let firstIncompleteIndex = -1;
    for (let i = 0; i < E4_STEP_ORDER.length; i++) {
      if (!statuses[E4_STEP_ORDER[i]]) {
        firstIncompleteIndex = i;
        break;
      }
    }

    return { statuses, firstIncompleteIndex };
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(initialState.firstIncompleteIndex);
  const [stepStatuses, setStepStatuses] = useState(initialState.statuses);
  const [incompleteRegions, setIncompleteRegions] = useState<IncompleteRegion[]>([]);
  const [includeAllRegions, setIncludeAllRegions] = useState(false);

  // Track expanded dropdowns for interview steps
  const [expanded, setExpanded] = useState<ExpandedState>({ left: null, right: null });
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  // -1 means all steps are complete
  const allComplete = currentStepIndex === -1;
  const currentStepId = allComplete ? E4_STEP_ORDER[0] : E4_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E4_STEP_ORDER.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const isInterview = String(currentStepId).endsWith("-interview");
  const stepInstances = allComplete ? [] : getInstancesForStep(currentStepId);

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
      setCurrentStepIndex((i) => i - 1);
    }
  };

  const performSkip = () => {
    setIncompleteRegions([]);
    setExpanded({ left: null, right: null });
    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "skipped" }));
    if (isLastStep) {
      setCurrentStepIndex(-1); // All steps complete, show collapsed view with section footer
    } else {
      setCurrentStepIndex((i) => i + 1);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setValue(inst.path as FieldPath<FormValues>, "no" as any);
      }
    }
    // Clear any validation errors since we've filled in the missing values
    setIncompleteRegions([]);
    // Reset expanded state
    setExpanded({ left: null, right: null });
  };

  const handleNext = () => {
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
        setCurrentStepIndex(-1);
      } else {
        setCurrentStepIndex((i) => i + 1);
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

    const isValid = validateStep(currentStepId);
    if (!isValid) {
      // Show skip dialog when validation fails
      setShowSkipDialog(true);
      return;
    }

    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "completed" }));
    setExpanded({ left: null, right: null });

    if (isLastStep) {
      setCurrentStepIndex(-1); // All steps complete, show collapsed view with section footer
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const getStepStatus = (stepId: ExaminationStepId, index: number): StepStatus => {
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
  const getStepSummary = (stepId: ExaminationStepId): string => {
    const instances = getInstancesForStep(stepId);
    const stepIsInterview = String(stepId).endsWith("-interview");

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
    // Pain interview - use pain interview flow
    if (stepIsInterview) {
      const interviewInstruction = E4_RICH_INSTRUCTIONS.painInterview;
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {E4_STEP_ORDER.map((stepId, index) => {
          const config = E4_STEP_CONFIG[stepId];
          const status = getStepStatus(stepId, index);

          if (status === "active") {
            const stepIsInterview = String(stepId).endsWith("-interview");

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

                {/* Content */}
                {stepIsInterview ? (
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
              onClick={() => setCurrentStepIndex(index)}
            />
          );
        })}

        <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unvollständige Daten</AlertDialogTitle>
              <AlertDialogDescription>
                Dieser Abschnitt enthält unvollständige Daten. Möchten Sie trotzdem
                fortfahren? Sie können später zurückkehren um die fehlenden Daten zu
                ergänzen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSkip}>
                Überspringen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
