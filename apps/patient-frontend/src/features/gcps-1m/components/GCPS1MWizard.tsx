/**
 * Main wizard orchestrator for GCPS 1-Month questionnaire
 */

import { useEffect, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { GCPS_1M_QUESTIONNAIRE, type GCPS1MAnswers } from "@cmdetect/questionnaires";
import { useGCPS1MNavigation } from "../hooks/useGCPS1MNavigation";
import { saveProgress, clearProgress } from "../persistence/storage";
import { ProgressHeader } from "./ProgressHeader";
import { GCPS1MQuestionScreen } from "./GCPS1MQuestionScreen";

type GCPS1MWizardProps = {
  token: string;
  initialIndex?: number;
  onComplete?: (answers: GCPS1MAnswers) => void;
};

export function GCPS1MWizard({
  token,
  initialIndex = 0,
  onComplete,
}: GCPS1MWizardProps) {
  const methods = useFormContext<GCPS1MAnswers>();
  const answers = methods.watch();

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  } = useGCPS1MNavigation(initialIndex);

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
    return <GCPS1MComplete answers={answers} />;
  }

  // When complete with onComplete handler, render nothing while parent transitions
  if (isComplete && onComplete) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <ProgressHeader current={currentIndex + 1} total={totalQuestions} />

      <Card>
        <CardContent className="pt-6">
          <GCPS1MQuestionScreen
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
function GCPS1MComplete({ answers }: { answers: GCPS1MAnswers }) {
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
            Vielen Dank für das Ausfüllen des {GCPS_1M_QUESTIONNAIRE.title}.
          </p>

          <p className="text-sm text-muted-foreground">
            {answeredCount} Fragen beantwortet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
