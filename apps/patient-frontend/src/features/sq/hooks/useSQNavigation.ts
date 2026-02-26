/**
 * Navigation hook for the DC/TMD Symptom Questionnaire wizard
 * Handles forward/back navigation with enableWhen conditions
 */

import { useState, useMemo, useCallback, useRef } from "react";
import {
  SQ_SCREENS,
  isQuestionEnabled,
  type SQQuestion,
  type SQAnswers,
} from "@cmdetect/questionnaires";
import {
  getSectionForQuestion,
  getQuestionPositionInSection,
  TOTAL_SECTIONS,
  type SQSection,
} from "../data/sqSections";

type UseSQNavigationReturn = {
  currentQuestion: SQQuestion | undefined;
  currentIndex: number;
  visibleTotal: number;
  canGoBack: boolean;
  isComplete: boolean;
  goNext: (currentAnswer?: string) => void;
  goBack: () => void;
  // Section tracking
  currentSection: SQSection | undefined;
  currentSectionIndex: number;
  totalSections: number;
  questionInSection: { current: number; total: number };
};

/**
 * Calculate the total number of enabled screens based on current answers
 * Uses enableWhen conditions to show accurate progress
 */
function calculateVisibleScreens(
  screens: SQQuestion[],
  answers: SQAnswers
): number {
  return screens.filter((q) => isQuestionEnabled(q.enableWhen, answers)).length;
}

/**
 * Find the next enabled screen index
 * Skips disabled questions based on enableWhen conditions
 */
function findNextEnabledIndex(
  currentIndex: number,
  screens: SQQuestion[],
  answers: SQAnswers
): number {
  for (let i = currentIndex + 1; i < screens.length; i++) {
    if (isQuestionEnabled(screens[i].enableWhen, answers)) {
      return i;
    }
  }
  return screens.length; // Complete
}

/**
 * Main navigation hook for the SQ wizard
 * Manages current position and history for back navigation
 */
export function useSQWizardNavigation(
  answers: SQAnswers,
  initialIndex: number = 0,
  initialHistory: number[] = []
): UseSQNavigationReturn {
  // Use state for currentIndex so component re-renders on navigation
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Use ref for history to avoid re-render loops when history changes
  // The history is only used for goBack, not for rendering
  const historyRef = useRef<number[]>(initialHistory);

  const currentQuestion = useMemo(
    () => SQ_SCREENS[currentIndex],
    [currentIndex]
  );

  const visibleTotal = useMemo(
    () => calculateVisibleScreens(SQ_SCREENS, answers),
    [answers]
  );

  const isComplete = currentIndex >= SQ_SCREENS.length;

  // Track history length in state so canGoBack triggers re-renders
  const [historyLength, setHistoryLength] = useState(initialHistory.length);
  const canGoBack = historyLength > 0;

  const goNext = useCallback(
    (currentAnswer?: string) => {
      // Merge current answer with existing answers to avoid stale closure issue
      // When auto-navigating, the form state update hasn't been applied yet
      const effectiveAnswers =
        currentAnswer !== undefined
          ? { ...answers, [SQ_SCREENS[currentIndex].id]: currentAnswer }
          : answers;

      const nextIndex = findNextEnabledIndex(currentIndex, SQ_SCREENS, effectiveAnswers);
      // Push current index to history before moving
      historyRef.current = [...historyRef.current, currentIndex];
      setHistoryLength(historyRef.current.length);
      setCurrentIndex(nextIndex);
    },
    [currentIndex, answers]
  );

  const goBack = useCallback(() => {
    if (historyRef.current.length === 0) return;

    const newHistory = [...historyRef.current];
    const previousIndex = newHistory.pop() ?? 0;
    historyRef.current = newHistory;
    setHistoryLength(newHistory.length);
    setCurrentIndex(previousIndex);
  }, []);

  // Section tracking
  const sectionInfo = useMemo(() => {
    if (!currentQuestion) {
      return {
        currentSection: undefined,
        currentSectionIndex: 0,
        questionInSection: { current: 1, total: 1 },
      };
    }

    const sectionResult = getSectionForQuestion(currentQuestion.id);
    const questionPosition = getQuestionPositionInSection(
      currentQuestion.id,
      answers
    );

    return {
      currentSection: sectionResult?.section,
      currentSectionIndex: sectionResult?.sectionIndex ?? 0,
      questionInSection: questionPosition,
    };
  }, [currentQuestion, answers]);

  return {
    currentQuestion,
    currentIndex,
    visibleTotal,
    canGoBack,
    isComplete,
    goNext,
    goBack,
    // Section tracking
    currentSection: sectionInfo.currentSection,
    currentSectionIndex: sectionInfo.currentSectionIndex,
    totalSections: TOTAL_SECTIONS,
    questionInSection: sectionInfo.questionInSection,
  };
}
