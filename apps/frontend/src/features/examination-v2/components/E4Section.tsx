import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkipForward, ArrowRight } from "lucide-react";
import { useExaminationForm, type ExaminationStepId } from "../form/use-examination-form";
import { QuestionField } from "./QuestionField";
import { getLabel, getSideLabel, getRegionLabel } from "../labels";
import type { QuestionInstance } from "../projections/to-instances";

// Step configuration
const E4_STEP_ORDER: ExaminationStepId[] = [
  "e4a",
  "e4b-measure",
  "e4b-interview",
  "e4c-measure",
  "e4c-interview",
];

const E4_STEP_CONFIG: Record<string, { badge: string; title: string }> = {
  "e4a": { badge: "E4A", title: "Schmerzfreie Mundöffnung" },
  "e4b-measure": { badge: "E4B", title: "Maximale aktive Mundöffnung" },
  "e4b-interview": { badge: "E4B", title: "Schmerzbefragung" },
  "e4c-measure": { badge: "E4C", title: "Maximale passive Mundöffnung" },
  "e4c-interview": { badge: "E4C", title: "Schmerzbefragung" },
};

interface E4SectionProps {
  onComplete?: () => void;
}

export function E4Section({ onComplete }: E4SectionProps) {
  const { form, validateStep, getInstancesForStep } = useExaminationForm();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStepId = E4_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E4_STEP_ORDER.length - 1;

  const handleNext = async () => {
    const isValid = await validateStep(currentStepId);
    if (!isValid) return;

    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
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
        <CardTitle>E4 - Öffnungs- und Schließbewegungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {E4_STEP_ORDER.map((stepId, index) => {
          const isCurrent = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          const config = E4_STEP_CONFIG[stepId];
          const stepInstances = getInstancesForStep(stepId);
          const isInterview = String(stepId).endsWith("-interview");

          // Current step - expanded
          if (isCurrent) {
            return (
              <Card key={stepId} className="border shadow-none">
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-full">{config.badge}</Badge>
                    <CardTitle className="text-base">{config.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {isInterview ? (
                    <InterviewStep instances={stepInstances} />
                  ) : (
                    <MeasurementStep instances={stepInstances} />
                  )}
                </CardContent>
                <Separator />
                <CardFooter className="justify-between pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    disabled={isLastStep}
                    className="text-muted-foreground"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Überspringen
                  </Button>
                  <Button type="button" onClick={handleNext}>
                    {isLastStep ? "Abschließen" : "Weiter"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            );
          }

          // Past or future step - collapsed row
          return (
            <div
              key={stepId}
              className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                isPast ? "cursor-pointer hover:bg-muted/50" : ""
              }`}
              onClick={isPast ? () => setCurrentStepIndex(index) : undefined}
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full">
                  {config.badge}
                </Badge>
                <span className={isPast ? "text-foreground" : "text-muted-foreground"}>
                  {config.title}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isPast ? getStepSummary(stepId) : "—"}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Measurement step: simple list of fields
function MeasurementStep({ instances }: { instances: QuestionInstance[] }) {
  return (
    <div className="space-y-4">
      {instances.map((instance) => (
        <QuestionField
          key={instance.path}
          instance={instance}
          label={getLabel(instance.labelKey)}
        />
      ))}
    </div>
  );
}

// Interview step: two-column layout by side, grouped by region
function InterviewStep({ instances }: { instances: QuestionInstance[] }) {
  const leftQuestions = instances.filter((i) => i.context.side === "left");
  const rightQuestions = instances.filter((i) => i.context.side === "right");

  return (
    <div className="grid grid-cols-2 gap-6">
      <InterviewColumn title={getSideLabel("left")} questions={leftQuestions} />
      <InterviewColumn title={getSideLabel("right")} questions={rightQuestions} />
    </div>
  );
}

// Group questions by region and render
function InterviewColumn({
  title,
  questions,
}: {
  title: string;
  questions: QuestionInstance[];
}) {
  // Group by region
  const byRegion = questions.reduce<Record<string, QuestionInstance[]>>(
    (acc, q) => {
      const region = q.context.region ?? "unknown";
      if (!acc[region]) acc[region] = [];
      acc[region].push(q);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm border-b pb-2">{title}</h4>
      {Object.entries(byRegion).map(([region, regionQuestions]) => (
        <div key={region} className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">
            {getRegionLabel(region)}
          </h5>
          <div className="pl-2 space-y-1">
            {regionQuestions.map((instance) => (
              <QuestionField
                key={instance.path}
                instance={instance}
                label={getLabel(instance.context.painType)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
