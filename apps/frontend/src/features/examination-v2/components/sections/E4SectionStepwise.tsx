import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle, SkipForward } from "lucide-react";
import { useState } from "react";
import type { FieldPath } from "react-hook-form";
import { E4_INSTRUCTIONS } from "../../content/instructions";
import {
  useExaminationForm,
  type ExaminationStepId,
  type FormValues,
} from "../../form/use-examination-form";
import { validateInterviewCompletion, type IncompleteRegion } from "../../form/validation";
import { ALL_REGIONS, BASE_REGIONS } from "../../model/regions";
import {
  DiagramInterviewStep,
  InstructionBlock,
  MeasurementStep,
  StepBar,
  TableInterviewStep,
  type StepStatus,
} from "../ui";
import { getLabel } from "../../labels";
import { QuestionField } from "../QuestionField";

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

// Map step IDs to instruction keys
const E4_STEP_INSTRUCTIONS: Record<
  string,
  "painFreeOpening" | "maxUnassistedOpening" | "maxAssistedOpening" | "painInterview"
> = {
  e4a: "painFreeOpening",
  "e4b-measure": "maxUnassistedOpening",
  "e4b-interview": "painInterview",
  "e4c-measure": "maxAssistedOpening",
  "e4c-interview": "painInterview",
};

interface E4SectionProps {
  onComplete?: () => void;
}

export function E4SectionStepwise({ onComplete }: E4SectionProps) {
  const { form, validateStep, getInstancesForStep } = useExaminationForm();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<Record<string, "completed" | "skipped">>({});
  const [incompleteRegions, setIncompleteRegions] = useState<IncompleteRegion[]>([]);
  const [diagramKey, setDiagramKey] = useState(0);
  const [includeAllRegions, setIncludeAllRegions] = useState(false);
  const [viewMode, setViewMode] = useState<"stepwise" | "form">("stepwise");

  const currentStepId = E4_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E4_STEP_ORDER.length - 1;
  const isInterview = String(currentStepId).endsWith("-interview");
  const stepInstances = getInstancesForStep(currentStepId);

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
    // Reset diagram selection by forcing remount
    setDiagramKey((k) => k + 1);
  };

  const handleNext = async () => {
    // For interview steps, validate completeness first
    if (isInterview) {
      const result = validateInterviewCompletion(stepInstances, (path) =>
        form.getValues(path as FieldPath<FormValues>)
      );
      if (!result.valid) {
        setIncompleteRegions(result.incompleteRegions);
        return;
      }
      setIncompleteRegions([]);
    }

    const isValid = await validateStep(currentStepId);
    if (!isValid) return;

    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "completed" }));

    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    setIncompleteRegions([]);
    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "skipped" }));

    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const getStepStatus = (stepId: ExaminationStepId, index: number): StepStatus => {
    if (index === currentStepIndex) return "active";
    if (stepStatuses[stepId]) return stepStatuses[stepId];
    return "pending";
  };

  // Get summary for a step (for collapsed display)
  const getStepSummary = (stepId: ExaminationStepId): string => {
    const instances = getInstancesForStep(stepId);
    const isInterview = String(stepId).endsWith("-interview");

    if (isInterview) {
      // Check if any pain was reported
      const hasPain = instances.some((inst) => {
        if (inst.context.painType === "pain") {
          const value = form.getValues(inst.path as keyof typeof form.getValues);
          return value === "yes";
        }
        return false;
      });
      return hasPain ? "Schmerz" : "Kein Schmerz";
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>U4 - Öffnungs- und Schließbewegungen</CardTitle>
          <div className="flex items-center gap-4">
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
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "stepwise" | "form")}
            >
              <TabsList className="h-8">
                <TabsTrigger value="stepwise" className="text-xs px-3">
                  Schrittweise
                </TabsTrigger>
                <TabsTrigger value="form" className="text-xs px-3">
                  Formular
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {viewMode === "form" ? (
          /* Compact form view - all sections at once */
          <div className="space-y-8">
            {/* E4A: Schmerzfreie Mundöffnung */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">U4A</Badge>
                <h4 className="font-medium">Schmerzfreie Mundöffnung</h4>
              </div>
              {getInstancesForStep("e4a").map((instance) => (
                <QuestionField
                  key={instance.path}
                  instance={instance}
                  label={getLabel(instance.labelKey)}
                />
              ))}
            </div>

            {/* E4B: Maximale aktive Mundöffnung */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">U4B</Badge>
                <h4 className="font-medium">Maximale aktive Mundöffnung</h4>
              </div>
              {getInstancesForStep("e4b-measure").map((instance) => (
                <QuestionField
                  key={instance.path}
                  instance={instance}
                  label={getLabel(instance.labelKey)}
                />
              ))}
              <TableInterviewStep
                instances={getInstancesForStep("e4b-interview")}
                regions={includeAllRegions ? ALL_REGIONS : BASE_REGIONS}
              />
            </div>

            {/* E4C: Maximale passive Mundöffnung */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">U4C</Badge>
                <h4 className="font-medium">Maximale passive Mundöffnung</h4>
              </div>
              {getInstancesForStep("e4c-measure").map((instance) => (
                <QuestionField
                  key={instance.path}
                  instance={instance}
                  label={getLabel(instance.labelKey)}
                />
              ))}
              <TableInterviewStep
                instances={getInstancesForStep("e4c-interview")}
                regions={includeAllRegions ? ALL_REGIONS : BASE_REGIONS}
              />
            </div>
          </div>
        ) : (
          /* Stepwise wizard view */
          E4_STEP_ORDER.map((stepId, index) => {
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
                  {(() => {
                    const instructionKey = E4_STEP_INSTRUCTIONS[stepId];
                    const instruction = E4_INSTRUCTIONS[instructionKey];

                    if (stepIsInterview && "prompt" in instruction) {
                      // Pain interview guidance
                      return (
                        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm space-y-1">
                          <div className="text-muted-foreground italic">"{instruction.prompt}"</div>
                          <div className="text-muted-foreground text-xs">{instruction.guidance}</div>
                        </div>
                      );
                    }

                    if (!stepIsInterview && "patientScript" in instruction) {
                      // Measurement step instruction
                      return (
                        <InstructionBlock
                          patientScript={instruction.patientScript}
                          examinerAction={instruction.examinerAction}
                        />
                      );
                    }

                    return null;
                  })()}

                  {/* Content */}
                  {stepIsInterview ? (
                    <DiagramInterviewStep
                      key={diagramKey}
                      instances={stepInstances}
                      incompleteRegions={incompleteRegions}
                      regions={includeAllRegions ? ALL_REGIONS : BASE_REGIONS}
                    />
                  ) : (
                    <MeasurementStep instances={stepInstances} />
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="text-muted-foreground"
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Überspringen
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {stepIsInterview && (
                        <Button type="button" variant="outline" onClick={handleNoMorePainRegions}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Keine weiteren Schmerzregionen
                        </Button>
                      )}
                      <Button type="button" onClick={handleNext}>
                        {isLastStep ? "Abschließen" : "Weiter"}
                        <ArrowRight className="h-4 w-4 ml-1" />
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
                onClick={() => setCurrentStepIndex(index)}
              />
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
