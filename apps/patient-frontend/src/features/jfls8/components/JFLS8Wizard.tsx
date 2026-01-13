/**
 * Main wizard orchestrator for JFLS-8 questionnaire
 */

import { useEffect, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { JFLS8_QUESTIONNAIRE, JFLS8_INSTRUCTIONS, type JFLS8Answers } from "@cmdetect/questionnaires";
import { useJFLS8Navigation } from "../hooks/useJFLS8Navigation";
import { saveProgress, clearProgress } from "../persistence/storage";
import { ProgressHeader } from "../../gcps-1m/components/ProgressHeader";
import { JFLS8QuestionScreen } from "./JFLS8QuestionScreen";

type JFLS8WizardProps = {
  token: string;
  initialIndex?: number;
  onComplete?: (answers: JFLS8Answers) => void;
};

export function JFLS8Wizard({
  token,
  initialIndex = 0,
  onComplete,
}: JFLS8WizardProps) {
  const methods = useFormContext<JFLS8Answers>();
  const answers = methods.watch();

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  } = useJFLS8Navigation(initialIndex);

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
    return <JFLS8Complete answers={answers} />;
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
        <p className="font-medium text-foreground">{JFLS8_INSTRUCTIONS[0]}</p>
        <p>{JFLS8_INSTRUCTIONS[1]}</p>
        <p>{JFLS8_INSTRUCTIONS[2]}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <JFLS8QuestionScreen
            question={currentQuestion}
            onNavigateNext={handleNext}
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
function JFLS8Complete({ answers }: { answers: JFLS8Answers }) {
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
            Vielen Dank für das Ausfüllen des {JFLS8_QUESTIONNAIRE.title}.
          </p>

          <p className="text-sm text-muted-foreground">
            {answeredCount} Fragen beantwortet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
