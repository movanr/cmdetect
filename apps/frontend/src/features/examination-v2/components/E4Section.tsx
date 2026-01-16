import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, SkipForward, ArrowRight } from "lucide-react";
import { useExaminationForm } from "../form/use-examination-form";
import { QuestionField } from "./QuestionField";
import { getLabel, getSideLabel, getRegionLabel } from "../labels";
import type { QuestionInstance } from "../projections/to-instances";

const STEP_ORDER = ["e4a", "e4b-measure", "e4b-interview", "e4c-measure", "e4c-interview"] as const;
type StepId = (typeof STEP_ORDER)[number];

const STEP_TITLES: Record<StepId, string> = {
  "e4a": "E4a - Schmerzfreie Öffnung",
  "e4b-measure": "E4b - Maximale Öffnung (unassistiert)",
  "e4b-interview": "E4b - Interview (unassistiert)",
  "e4c-measure": "E4c - Maximale Öffnung (assistiert)",
  "e4c-interview": "E4c - Interview (assistiert)",
};

export function E4Section() {
  const { form, validateStep, getInstancesForStep } = useExaminationForm();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStepId = STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;

  const handleNext = async () => {
    const isValid = await validateStep(currentStepId);
    if (isValid && !isLastStep) {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    if (!isLastStep) {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  // Watch values for debug display
  const allValues = form.watch();

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">E4 - Mundöffnung</h2>
          <span className="text-sm text-muted-foreground">
            Schritt {currentStepIndex + 1} / {STEP_ORDER.length}
          </span>
        </div>

        {/* All steps as collapsible sections */}
        <div className="space-y-2">
          {STEP_ORDER.map((stepId, index) => {
            const isPrevious = index < currentStepIndex;
            const isFuture = index > currentStepIndex;
            const stepInstances = getInstancesForStep(stepId);
            const isInterview = stepId.endsWith("-interview");

            // Hide future steps
            if (isFuture) return null;

            // Collapsed previous step (clickable title bar)
            if (isPrevious) {
              return (
                <div
                  key={stepId}
                  className="border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setCurrentStepIndex(index)}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{STEP_TITLES[stepId]}</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Expanded current step
            return (
              <div key={stepId} className="border rounded-lg">
                <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{STEP_TITLES[stepId]}</span>
                </div>
                <div className="p-4 space-y-4">
                  {isInterview ? (
                    <InterviewStep instances={stepInstances} />
                  ) : (
                    <MeasurementStep instances={stepInstances} />
                  )}
                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-muted-foreground"
                      disabled={isLastStep}
                    >
                      <SkipForward className="h-4 w-4 mr-1" />
                      Überspringen
                    </Button>
                    <Button type="button" onClick={handleNext}>
                      {isLastStep ? "Abschließen" : "Weiter"}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Debug: Current Values */}
        <details className="border rounded">
          <summary className="p-2 cursor-pointer font-medium text-sm">
            Debug: Form Values
          </summary>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64">
            {JSON.stringify(allValues, null, 2)}
          </pre>
        </details>
      </div>
    </FormProvider>
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
      <h4 className="font-medium text-base border-b pb-1">{title}</h4>
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
