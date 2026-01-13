/**
 * Generic Wizard Component
 * Handles navigation, persistence, and completion for any questionnaire
 */

import { useEffect, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { useLinearNavigation } from "../hooks/useLinearNavigation";
import { clearProgress } from "../persistence/storage";
import { ProgressHeader } from "./ProgressHeader";
import { QuestionRenderer } from "./questions/QuestionRenderer";
import { QuestionnaireComplete } from "./QuestionnaireComplete";
import type { GenericQuestionnaire, GenericQuestion } from "../types";

type GenericWizardProps = {
  questionnaire: GenericQuestionnaire;
  token?: string; // Kept for API compatibility, not used after removing persistence
  initialIndex?: number;
  onComplete?: (answers: Record<string, unknown>) => void;
};

export function GenericWizard({
  questionnaire,
  token: _token,
  initialIndex = 0,
  onComplete,
}: GenericWizardProps) {
  const methods = useFormContext<Record<string, unknown>>();
  const hasCalledComplete = useRef(false);

  const questionnaireId = questionnaire.id;

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  } = useLinearNavigation({
    questions: questionnaire.questions as GenericQuestion[],
    initialIndex,
  });

  // Handle navigation
  const handleNext = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // Handle completion
  useEffect(() => {
    if (isComplete && onComplete && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      clearProgress(questionnaireId);
      onComplete(methods.getValues());
    }
  }, [isComplete, onComplete, questionnaireId, methods]);

  // Show completion screen only if no onComplete handler (standalone mode)
  if (isComplete && !onComplete) {
    const currentAnswers = methods.getValues();
    const answeredCount = Object.values(currentAnswers).filter(
      (value) => value !== undefined
    ).length;
    return (
      <QuestionnaireComplete
        title={questionnaire.title}
        answeredCount={answeredCount}
      />
    );
  }

  // When complete with onComplete handler, show submitting state while parent processes
  if (isComplete && onComplete) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center">
        <p className="text-muted-foreground">Fragebogen wird übermittelt...</p>
      </div>
    );
  }

  // Get instruction - handle both instruction (string) and instructions (array)
  const instruction =
    questionnaire.instruction ?? questionnaire.instructions?.[0];

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <ProgressHeader current={currentIndex + 1} total={totalQuestions} />

      {/* Optional multi-line instructions (for JFLS) */}
      {questionnaire.instructions && questionnaire.instructions.length > 1 && (
        <div className="text-sm text-muted-foreground space-y-2 px-1">
          {questionnaire.instructions.map((inst, i) => (
            <p key={i} className={i === 0 ? "font-medium text-foreground" : ""}>
              {inst}
            </p>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <QuestionRenderer
            question={currentQuestion}
            options={questionnaire.options}
            sections={questionnaire.sections}
            instruction={instruction}
            onNavigateNext={handleNext}
          />
        </CardContent>
      </Card>

      {/* Back button */}
      <div className="flex justify-start pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={!canGoBack}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Zurück
        </Button>
      </div>
    </div>
  );
}
