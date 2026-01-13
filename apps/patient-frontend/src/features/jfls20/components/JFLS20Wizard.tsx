/**
 * Main wizard orchestrator for JFLS-20 questionnaire
 */

import { useEffect, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import {
  JFLS20_QUESTIONNAIRE,
  JFLS20_INSTRUCTIONS,
  type JFLS20Answers,
} from "@cmdetect/questionnaires";
import { useJFLS20Navigation } from "../hooks/useJFLS20Navigation";
import { saveProgress, clearProgress } from "../persistence/storage";
import { ProgressHeader } from "../../gcps-1m/components/ProgressHeader";
import { JFLS20QuestionScreen } from "./JFLS20QuestionScreen";

type JFLS20WizardProps = {
  token: string;
  initialIndex?: number;
  onComplete?: (answers: JFLS20Answers) => void;
};

export function JFLS20Wizard({
  token,
  initialIndex = 0,
  onComplete,
}: JFLS20WizardProps) {
  const methods = useFormContext<JFLS20Answers>();
  const answers = methods.watch();

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  } = useJFLS20Navigation(initialIndex);

  const hasCalledComplete = useRef(false);

  // Persist progress on every change
  useEffect(() => {
    if (!isComplete) {
      saveProgress(token, answers, currentIndex);
    }
  }, [token, answers, currentIndex, isComplete]);

  // Handle navigation
  const handleNext = useCallback(() => {
    goNext();
  }, [goNext]);

  const handleSkip = useCallback(() => {
    goNext(); // Advance without setting answer
  }, [goNext]);

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // Handle completion
  useEffect(() => {
    if (isComplete && onComplete && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      clearProgress();
      onComplete(answers);
    }
  }, [isComplete, onComplete, answers]);

  // Show completion screen only if no onComplete handler (standalone mode)
  if (isComplete && !onComplete) {
    return <JFLS20Complete answers={answers} />;
  }

  // When complete with onComplete handler, render nothing while parent transitions
  if (isComplete && onComplete) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <ProgressHeader current={currentIndex + 1} total={totalQuestions} />

      {/* Main instruction - shown on all questions */}
      <div className="text-sm text-muted-foreground space-y-2 px-1">
        <p className="font-medium text-foreground">{JFLS20_INSTRUCTIONS[0]}</p>
        <p>{JFLS20_INSTRUCTIONS[1]}</p>
        <p>{JFLS20_INSTRUCTIONS[2]}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <JFLS20QuestionScreen
            question={currentQuestion}
            onNavigateNext={handleNext}
            onSkip={handleSkip}
          />
        </CardContent>
      </Card>

      {/* Back button */}
      {canGoBack && (
        <div className="flex justify-start">
          <Button type="button" variant="outline" onClick={handleBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Zurück
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Completion screen
 */
function JFLS20Complete({ answers }: { answers: JFLS20Answers }) {
  const answeredCount = Object.values(answers).filter(
    (value) => value !== undefined
  ).length;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold">Fragebogen abgeschlossen</h2>

          <p className="text-muted-foreground">
            Vielen Dank für das Ausfüllen des {JFLS20_QUESTIONNAIRE.title}.
          </p>

          <p className="text-sm text-muted-foreground">
            {answeredCount} Fragen beantwortet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
