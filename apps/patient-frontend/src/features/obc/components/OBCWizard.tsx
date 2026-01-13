/**
 * Main wizard orchestrator for OBC questionnaire
 * Handles section transitions and PHQ-4 style navigation
 */

import { useEffect, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { OBC_QUESTIONNAIRE, type OBCAnswers } from "@cmdetect/questionnaires";
import { useOBCNavigation } from "../hooks/useOBCNavigation";
import { saveProgress, clearProgress } from "../persistence/storage";
import { ProgressHeader } from "../../gcps-1m/components/ProgressHeader";
import { OBCQuestionScreen } from "./OBCQuestionScreen";
import { OBCSectionIntro } from "./OBCSectionIntro";

type OBCWizardProps = {
  token: string;
  initialIndex?: number;
  onComplete?: (answers: OBCAnswers) => void;
};

export function OBCWizard({
  token,
  initialIndex = 0,
  onComplete,
}: OBCWizardProps) {
  const methods = useFormContext<OBCAnswers>();
  const answers = methods.watch();

  const {
    currentQuestion,
    currentIndex,
    currentSection,
    totalQuestions,
    canGoBack,
    isComplete,
    showingSectionIntro,
    goNext,
    goBack,
  } = useOBCNavigation(initialIndex);

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
    return <OBCComplete answers={answers} />;
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
          {showingSectionIntro ? (
            <OBCSectionIntro
              sectionId={currentSection}
              onContinue={handleNext}
            />
          ) : (
            <OBCQuestionScreen
              question={currentQuestion}
              sectionId={currentSection}
              onNavigateNext={handleNext}
            />
          )}
        </CardContent>
      </Card>

      {/* Back button */}
      {canGoBack && !showingSectionIntro && (
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
function OBCComplete({ answers }: { answers: OBCAnswers }) {
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
            Vielen Dank für das Ausfüllen des {OBC_QUESTIONNAIRE.title}.
          </p>

          <p className="text-sm text-muted-foreground">
            {answeredCount} Fragen beantwortet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
