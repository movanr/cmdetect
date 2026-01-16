import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, SkipForward, ArrowRight } from "lucide-react";
import {
  useExaminationForm,
  type ExaminationStepId,
} from "../form/use-examination-form";
import { QuestionField } from "./QuestionField";
import {
  getLabel,
  getPalpationSiteLabel,
  getMuscleGroupLabel,
} from "../labels";
import type { QuestionInstance } from "../projections/to-instances";
import { E9_MUSCLE_GROUPS } from "../model/e9-contexts";

const E9_STEP_ORDER: ExaminationStepId[] = ["e9-left", "e9-right"];

const E9_STEP_TITLES: Record<string, string> = {
  "e9-left": "E9 - Links",
  "e9-right": "E9 - Rechts",
};

export function E9Section() {
  const { validateStep, getInstancesForStep } = useExaminationForm();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStepId = E9_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E9_STEP_ORDER.length - 1;

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

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">E9 - Palpation Muskeln & TMJ</h2>
        <span className="text-sm text-muted-foreground">
          Schritt {currentStepIndex + 1} / {E9_STEP_ORDER.length}
        </span>
      </div>

      {/* All steps as collapsible sections */}
      <div className="space-y-2">
        {E9_STEP_ORDER.map((stepId, index) => {
          const isPrevious = index < currentStepIndex;
          const isFuture = index > currentStepIndex;
          const stepInstances = getInstancesForStep(stepId);

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
                    <span className="font-medium">{E9_STEP_TITLES[stepId]}</span>
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
                <span className="font-medium">{E9_STEP_TITLES[stepId]}</span>
              </div>
              <div className="p-4 space-y-4">
                <PalpationStep instances={stepInstances} />
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
    </div>
  );
}

// Group questions by muscle group and site
function PalpationStep({ instances }: { instances: QuestionInstance[] }) {
  // Group by muscleGroup context
  const byMuscleGroup = instances.reduce<Record<string, QuestionInstance[]>>(
    (acc, q) => {
      const group = q.context.muscleGroup ?? "unknown";
      if (!acc[group]) acc[group] = [];
      acc[group].push(q);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {E9_MUSCLE_GROUPS.map((group) => {
        const groupQuestions = byMuscleGroup[group];
        if (!groupQuestions?.length) return null;

        return (
          <div key={group} className="space-y-4">
            <h4 className="font-medium text-base border-b pb-1">
              {getMuscleGroupLabel(group)}
            </h4>
            <SiteQuestions questions={groupQuestions} />
          </div>
        );
      })}
    </div>
  );
}

// Group questions by palpation site within a muscle group
function SiteQuestions({ questions }: { questions: QuestionInstance[] }) {
  // Group by site
  const bySite = questions.reduce<Record<string, QuestionInstance[]>>(
    (acc, q) => {
      const site = q.context.site ?? "unknown";
      if (!acc[site]) acc[site] = [];
      acc[site].push(q);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4 pl-2">
      {Object.entries(bySite).map(([site, siteQuestions]) => (
        <div key={site} className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">
            {getPalpationSiteLabel(site)}
          </h5>
          <div className="pl-2 space-y-1">
            {siteQuestions.map((instance) => (
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
