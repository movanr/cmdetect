/**
 * E1: Pain & Headache Location Section
 *
 * Two-step flow:
 * - E1a: Pain location in the last 30 days
 * - E1b: Headache location in the last 30 days
 *
 * Each step includes interactive HeadDiagram components that are
 * bidirectionally linked to the checkbox groups.
 */

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
import { Separator } from "@/components/ui/separator";
import {
  E1_HEADACHE_LOCATIONS,
  E1_PAIN_LOCATIONS,
  SECTIONS,
  SVG_REGIONS,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ChevronLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { E1_RICH_INSTRUCTIONS } from "../../content/instructions";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { HeadDiagram } from "../HeadDiagram/head-diagram";
import type { RegionStatus } from "../HeadDiagram/types";
import { QuestionField } from "../QuestionField";
import { PainInterviewBlock, SectionFooter, StepBar, type StepStatus } from "../ui";

// Step configuration
type E1StepId = "e1a" | "e1b";

const E1_STEP_ORDER: E1StepId[] = ["e1a", "e1b"];

const E1_STEP_CONFIG: Record<E1StepId, { badge: string; title: string }> = {
  e1a: { badge: "U1A", title: "Schmerzlokalisation (letzte 30 Tage)" },
  e1b: { badge: "U1B", title: "Kopfschmerzlokalisation (letzte 30 Tage)" },
};

/**
 * Regions supported by HeadDiagram for E1 pain location.
 */
const E1_PAIN_SVG_REGIONS: readonly Region[] = SVG_REGIONS;

/**
 * For headache location, only temporalis is visualizable.
 */
const E1_HEADACHE_SVG_REGIONS: readonly Region[] = ["temporalis"];

interface E1SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isFirstSection?: boolean;
}

/**
 * Compute RegionStatus for E1 based on checkbox values.
 */
function computeE1RegionStatus(region: Region, values: string[] | undefined): RegionStatus {
  const isSelected = values?.includes(region) ?? false;
  return {
    hasData: true,
    isPainPositive: isSelected,
    hasFamiliarPainData: true,
    hasFamiliarPain: isSelected,
    hasFamiliarHeadacheData: true,
    hasFamiliarHeadache: false,
    isComplete: true,
  };
}

/**
 * Build summary string from selected regions.
 * Shows laterality: (rechts), (links), or (beidseitig)
 */
function buildRegionSummary(
  rightValues: string[] | undefined,
  leftValues: string[] | undefined,
  regionLabels: Record<string, string>,
  noneLabel: string
): string {
  const right = (rightValues ?? []).filter((v) => v !== "none");
  const left = (leftValues ?? []).filter((v) => v !== "none");

  if (right.length === 0 && left.length === 0) {
    return noneLabel;
  }

  // Collect all unique regions
  const allRegions = new Set([...right, ...left]);
  const parts: string[] = [];

  for (const region of allRegions) {
    const label = regionLabels[region] || region;
    const inRight = right.includes(region);
    const inLeft = left.includes(region);

    if (inRight && inLeft) {
      parts.push(`${label} (beidseitig)`);
    } else if (inRight) {
      parts.push(`${label} (rechts)`);
    } else {
      parts.push(`${label} (links)`);
    }
  }

  return parts.join(", ");
}

/**
 * Check if a step has data (for computing initial state).
 */
function stepHasData(
  stepId: E1StepId,
  getValue: (path: string) => unknown
): boolean {
  if (stepId === "e1a") {
    const right = getValue("e1.painLocation.right") as string[] | undefined;
    const left = getValue("e1.painLocation.left") as string[] | undefined;
    return (right != null && right.length > 0) || (left != null && left.length > 0);
  } else {
    const right = getValue("e1.headacheLocation.right") as string[] | undefined;
    const left = getValue("e1.headacheLocation.left") as string[] | undefined;
    return (right != null && right.length > 0) || (left != null && left.length > 0);
  }
}

export function E1Section({ onComplete, onBack, isFirstSection }: E1SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();
  const { watch, getValues, setValue } = useFormContext();

  // Compute initial state from form values
  const [initialState] = useState(() => {
    const statuses: Record<string, "completed" | "skipped"> = {};
    for (const stepId of E1_STEP_ORDER) {
      if (stepHasData(stepId, getValues)) {
        statuses[stepId] = "completed";
      }
    }

    // Find first incomplete step, or -1 if all complete
    let firstIncompleteIndex = -1;
    for (let i = 0; i < E1_STEP_ORDER.length; i++) {
      if (!statuses[E1_STEP_ORDER[i]]) {
        firstIncompleteIndex = i;
        break;
      }
    }

    return { statuses, firstIncompleteIndex };
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(initialState.firstIncompleteIndex);
  const [stepStatuses, setStepStatuses] = useState(initialState.statuses);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const allInstances = getInstancesForStep("e1-all");

  // Split instances by type and side
  const painRight = allInstances.find((i) => i.path === "e1.painLocation.right");
  const painLeft = allInstances.find((i) => i.path === "e1.painLocation.left");
  const headacheRight = allInstances.find((i) => i.path === "e1.headacheLocation.right");
  const headacheLeft = allInstances.find((i) => i.path === "e1.headacheLocation.left");

  // Watch values for reactive updates
  const painRightValues = watch("e1.painLocation.right") as string[] | undefined;
  const painLeftValues = watch("e1.painLocation.left") as string[] | undefined;
  const headacheRightValues = watch("e1.headacheLocation.right") as string[] | undefined;
  const headacheLeftValues = watch("e1.headacheLocation.left") as string[] | undefined;

  // Derived state
  const allComplete = currentStepIndex === -1;
  const currentStepId = allComplete ? E1_STEP_ORDER[0] : E1_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E1_STEP_ORDER.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Compute region statuses for pain location diagrams
  const painRightStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_PAIN_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, painRightValues);
    }
    return statuses;
  }, [painRightValues]);

  const painLeftStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_PAIN_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, painLeftValues);
    }
    return statuses;
  }, [painLeftValues]);

  // Compute region statuses for headache location diagrams
  const headacheRightStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_HEADACHE_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, headacheRightValues);
    }
    return statuses;
  }, [headacheRightValues]);

  const headacheLeftStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_HEADACHE_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, headacheLeftValues);
    }
    return statuses;
  }, [headacheLeftValues]);

  // Handle diagram region click for pain location
  const handlePainRegionClick = useCallback(
    (region: Region, side: Side) => {
      const fieldPath = `e1.painLocation.${side}` as const;
      const currentValues = (getValues(fieldPath) as string[]) ?? [];

      if (currentValues.includes(region)) {
        setValue(
          fieldPath,
          currentValues.filter((v) => v !== region),
          { shouldValidate: true }
        );
      } else {
        const newValues = currentValues.filter((v) => v !== "none");
        setValue(fieldPath, [...newValues, region], { shouldValidate: true });
      }
    },
    [getValues, setValue]
  );

  // Handle diagram region click for headache location
  const handleHeadacheRegionClick = useCallback(
    (region: Region, side: Side) => {
      const fieldPath = `e1.headacheLocation.${side}` as const;
      const currentValues = (getValues(fieldPath) as string[]) ?? [];

      if (currentValues.includes(region)) {
        setValue(
          fieldPath,
          currentValues.filter((v) => v !== region),
          { shouldValidate: true }
        );
      } else {
        const newValues = currentValues.filter((v) => v !== "none");
        setValue(fieldPath, [...newValues, region], { shouldValidate: true });
      }
    },
    [getValues, setValue]
  );

  // Navigation handlers
  const handleBack = () => {
    if (isFirstStep) {
      onBack?.();
    } else {
      setCurrentStepIndex((i) => i - 1);
    }
  };

  const performSkip = () => {
    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "skipped" }));
    if (isLastStep) {
      setCurrentStepIndex(-1);
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    performSkip();
  };

  const handleNext = () => {
    // Validate current step (triggers form errors)
    const stepIdForValidation = currentStepId === "e1a" ? "e1a" : "e1b";
    const isValid = validateStep(stepIdForValidation);

    if (!isValid) {
      // Invalid data - show skip confirmation dialog
      setShowSkipDialog(true);
      return;
    }

    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "completed" }));

    if (isLastStep) {
      setCurrentStepIndex(-1);
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const getStepStatus = (stepId: E1StepId, index: number): StepStatus => {
    if (allComplete) {
      return stepStatuses[stepId] || "pending";
    }
    if (index === currentStepIndex) return "active";
    if (stepStatuses[stepId]) return stepStatuses[stepId];
    return "pending";
  };

  const getStepSummary = (stepId: E1StepId): string => {
    if (stepId === "e1a") {
      return buildRegionSummary(
        painRightValues,
        painLeftValues,
        E1_PAIN_LOCATIONS,
        "Kein Schmerz"
      );
    } else {
      return buildRegionSummary(
        headacheRightValues,
        headacheLeftValues,
        E1_HEADACHE_LOCATIONS,
        "Keine Kopfschmerzen"
      );
    }
  };

  // Render active step content
  const renderStepContent = (stepId: E1StepId) => {
    if (stepId === "e1a") {
      return (
        <div className="space-y-6">
          {/* Instruction flow */}
          <PainInterviewBlock instruction={E1_RICH_INSTRUCTIONS.painLocation} />

          {/* Diagram and selection */}
          <div className="flex justify-center items-start gap-8 md:gap-16">
            {/* Right side panel */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Rechte Seite</span>
              <HeadDiagram
                side="right"
                regions={E1_PAIN_SVG_REGIONS}
                regionStatuses={painRightStatuses}
                onRegionClick={(region) => handlePainRegionClick(region, "right")}
              />
              <div className="w-44">{painRight && <QuestionField instance={painRight} />}</div>
            </div>

            <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />

            {/* Left side panel */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Linke Seite</span>
              <HeadDiagram
                side="left"
                regions={E1_PAIN_SVG_REGIONS}
                regionStatuses={painLeftStatuses}
                onRegionClick={(region) => handlePainRegionClick(region, "left")}
              />
              <div className="w-44">{painLeft && <QuestionField instance={painLeft} />}</div>
            </div>
          </div>
        </div>
      );
    }

    // E1b: Headache location
    return (
      <div className="space-y-6">
        {/* Instruction flow */}
        <PainInterviewBlock instruction={E1_RICH_INSTRUCTIONS.headacheLocation} />

        {/* Diagram and selection */}
        <div className="flex justify-center items-start gap-8 md:gap-16">
          {/* Right side panel */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Rechts</span>
            <HeadDiagram
              side="right"
              regions={E1_HEADACHE_SVG_REGIONS}
              regionStatuses={headacheRightStatuses}
              onRegionClick={(region) => handleHeadacheRegionClick(region, "right")}
            />
            <div className="w-44">
              {headacheRight && <QuestionField instance={headacheRight} />}
            </div>
          </div>

          <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />

          {/* Left side panel */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Links</span>
            <HeadDiagram
              side="left"
              regions={E1_HEADACHE_SVG_REGIONS}
              regionStatuses={headacheLeftStatuses}
              onRegionClick={(region) => handleHeadacheRegionClick(region, "left")}
            />
            <div className="w-44">
              {headacheLeft && <QuestionField instance={headacheLeft} />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getSectionCardTitle(SECTIONS.e1)}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/protocol/$section" params={{ section: "e1" }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Protokoll
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {E1_STEP_ORDER.map((stepId, index) => {
          const config = E1_STEP_CONFIG[stepId];
          const status = getStepStatus(stepId, index);

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

          // Collapsed step
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
