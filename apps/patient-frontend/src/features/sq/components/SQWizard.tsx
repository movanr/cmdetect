/**
 * Main wizard orchestrator for the DC/TMD Symptom Questionnaire
 * Coordinates form state, navigation, and persistence
 */

import { Card, CardContent } from "@/components/ui/card";
import type { SQAnswers } from "@cmdetect/questionnaires";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { filterEnabledAnswers } from "../hooks/evaluateEnableWhen";
import { useSQWizardNavigation } from "../hooks/useSQNavigation";
import { validateScreen } from "../schema/sqSchema";
import { NavigationButtons } from "./NavigationButtons";
import { ProgressHeader, type TransitionPhase } from "./ProgressHeader";
import { QuestionScreen } from "./QuestionScreen";

type SQWizardProps = {
  token?: string; // Kept for API compatibility, not used after removing persistence
  initialIndex?: number;
  initialHistory?: number[];
  transitionPhase?: TransitionPhase;
  onTransitionPhaseComplete?: (phase: TransitionPhase) => void;
  onComplete?: (answers: SQAnswers) => void;
};

export function SQWizard({
  token: _token,
  initialIndex = 0,
  initialHistory = [],
  transitionPhase = "active",
  onTransitionPhaseComplete,
  onComplete,
}: SQWizardProps) {
  const methods = useFormContext<SQAnswers>();
  const answers = methods.watch();

  const {
    currentQuestion,
    currentIndex: _currentIndex,
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

  // Handle next/auto-navigate with validation
  // selectedValue is passed from auto-navigating question types to avoid stale state
  const handleNext = useCallback(
    (selectedValue?: string) => {
      if (!currentQuestion) return;

      // Use passed value (for auto-navigate) or get fresh value from form (for Next button)
      // getValues() ensures we get the current form value, avoiding stale closure issues
      const currentValue = selectedValue ?? methods.getValues(currentQuestion.id);

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
      const enabledAnswers = filterEnabledAnswers(methods.getValues() as SQAnswers);
      onComplete(enabledAnswers);
    }
  }, [isComplete, onComplete, methods]);

  // Show completion screen only if no onComplete handler (standalone mode)
  if (isComplete && !onComplete) {
    const enabledAnswers = filterEnabledAnswers(answers);
    return <SQComplete answers={enabledAnswers} />;
  }

  // Check if we're in transition mode (completing/success/exiting)
  const isTransitioning = transitionPhase !== "active";

  // When complete with onComplete handler, currentQuestion is undefined
  // Show only the progress bar during transition animation
  const showQuestionContent = currentQuestion !== undefined;

  // Only show Next button for composite_number questions (need explicit submission)
  const showNextButton = currentQuestion?.type === "composite_number";

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <ProgressHeader
        sectionIndex={showQuestionContent ? currentSectionIndex : totalSections - 1}
        totalSections={totalSections}
        sectionName={currentSection?.name ?? ""}
        questionInSection={
          showQuestionContent ? questionInSection.current : questionInSection.total
        }
        totalInSection={questionInSection.total}
        transitionPhase={transitionPhase}
        onTransitionPhaseComplete={onTransitionPhaseComplete}
      />

      {/* Content fades during transition, hidden when complete */}
      {showQuestionContent && (
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
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
            canGoBack={canGoBack && !isTransitioning}
            showNext={showNextButton}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Completion screen shown after questionnaire is finished
 */
function SQComplete({ answers }: { answers: SQAnswers }) {
  // Count answered questions
  const answeredCount = Object.values(answers).filter((value) => value !== undefined).length;

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
            Vielen Dank für das Ausfüllen des Symptom-Fragebogens. Ihre Antworten wurden erfasst.
          </p>

          <p className="text-sm text-muted-foreground">{answeredCount} Fragen beantwortet</p>
        </CardContent>
      </Card>
    </div>
  );
}
