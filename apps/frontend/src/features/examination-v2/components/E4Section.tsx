import { useState } from "react";
import { FormProvider } from "react-hook-form";
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
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_ORDER.length - 1;

  const instances = getInstancesForStep(currentStepId);
  const isInterviewStep = currentStepId.endsWith("-interview");

  const handleNext = async () => {
    const isValid = await validateStep(currentStepId);
    if (isValid && !isLastStep) {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((i) => i - 1);
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

        {/* Progress bar */}
        <div className="flex gap-1">
          {STEP_ORDER.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded ${
                idx <= currentStepIndex ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Current step content */}
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-medium text-lg">{STEP_TITLES[currentStepId]}</h3>

          {isInterviewStep ? (
            <InterviewStep instances={instances} />
          ) : (
            <MeasurementStep instances={instances} />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            className="px-4 py-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            Zurück
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={handleNext}
          >
            {isLastStep ? "Abschließen" : "Weiter"}
          </button>
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
