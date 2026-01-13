/**
 * Main wizard orchestrator for the DC/TMD Symptom Questionnaire
 * Coordinates form state, navigation, and persistence
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import type { SQAnswers } from "@cmdetect/questionnaires";
import { useSQWizardNavigation } from "../hooks/useSQNavigation";
import { validateScreen } from "../schema/sqSchema";
import { filterEnabledAnswers } from "../hooks/evaluateEnableWhen";
import { saveProgress, clearProgress } from "../persistence/storage";
import { ProgressHeader } from "./ProgressHeader";
import { QuestionScreen } from "./QuestionScreen";
import { NavigationButtons } from "./NavigationButtons";

type SQWizardProps = {
  token: string;
  initialIndex?: number;
  initialHistory?: number[];
  onComplete?: (answers: SQAnswers) => void;
};

export function SQWizard({
  token,
  initialIndex = 0,
  initialHistory = [],
  onComplete,
}: SQWizardProps) {
  const methods = useFormContext<SQAnswers>();
  const answers = methods.watch();

  const {
    currentQuestion,
    currentIndex,
    canGoBack,
    isComplete,
    goNext,
    goBack,
    // Section tracking
    currentSection,
    currentSectionIndex,
    totalSections,
    questionInSection,
  } = useSQWizardNavigation(answers, initialIndex, initialHistory);

  const [error, setError] = useState<string | undefined>();
  const hasCalledComplete = useRef(false);

  // Persist progress on every change
  useEffect(() => {
    if (!isComplete) {
      saveProgress(token, answers, currentIndex, []);
    }
  }, [token, answers, currentIndex, isComplete]);

  // Handle next/auto-navigate with validation
  // selectedValue is passed from auto-navigating question types to avoid stale state
  const handleNext = useCallback(
    (selectedValue?: string) => {
      if (!currentQuestion) return;

      // Use passed value (for auto-navigate) or get fresh value from form (for Next button)
      // getValues() ensures we get the current form value, avoiding stale closure issues
      const currentValue =
        selectedValue ?? methods.getValues(currentQuestion.id);

      const result = validateScreen(currentQuestion, currentValue);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setError(undefined);
      goNext(selectedValue);
    },
    [currentQuestion, methods, goNext]
  );

  // Handle back button click
  const handleBack = useCallback(() => {
    setError(undefined);
    goBack();
  }, [goBack]);

  // Handle completion - filter to only enabled answers before callback
  useEffect(() => {
    if (isComplete && onComplete && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      clearProgress();
      const enabledAnswers = filterEnabledAnswers(answers);
      onComplete(enabledAnswers);
    }
  }, [isComplete, onComplete]);

  // Show completion screen only if no onComplete handler (standalone mode)
  if (isComplete && !onComplete) {
    const enabledAnswers = filterEnabledAnswers(answers);
    return <SQComplete answers={enabledAnswers} />;
  }

  // When complete with onComplete handler, render nothing while parent transitions
  if (isComplete && onComplete) {
    return null;
  }

  // Safety check
  if (!currentQuestion) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center">
        <p className="text-destructive">
          Ein Fehler ist aufgetreten. Bitte laden Sie die Seite neu.
        </p>
      </div>
    );
  }

  // Only show Next button for composite_number questions (need explicit submission)
  const showNextButton = currentQuestion.type === "composite_number";

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <ProgressHeader
        sectionIndex={currentSectionIndex}
        totalSections={totalSections}
        sectionName={currentSection?.name ?? ""}
        questionInSection={questionInSection.current}
        totalInSection={questionInSection.total}
      />

      <Card>
        <CardContent className="pt-6">
          <QuestionScreen
            question={currentQuestion}
            error={error}
            onNavigateNext={handleNext}
          />
        </CardContent>
      </Card>

      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={canGoBack}
        showNext={showNextButton}
      />
    </div>
  );
}

/**
 * Completion screen shown after questionnaire is finished
 */
function SQComplete({ answers }: { answers: SQAnswers }) {
  // Count answered questions
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
            Vielen Dank für das Ausfüllen des Symptom-Fragebogens. Ihre
            Antworten wurden erfasst.
          </p>

          <p className="text-sm text-muted-foreground">
            {answeredCount} Fragen beantwortet
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
