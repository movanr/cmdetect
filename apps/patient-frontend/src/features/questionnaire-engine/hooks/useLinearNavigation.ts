/**
 * Generic linear navigation hook for questionnaires
 * No skip logic - simple forward/back through questions
 */

import { useState, useCallback, useRef } from "react";
import type { NavigationState, GenericQuestion } from "../types";

type UseLinearNavigationOptions = {
  questions: readonly GenericQuestion[];
  initialIndex?: number;
};

export function useLinearNavigation({
  questions,
  initialIndex = 0,
}: UseLinearNavigationOptions): NavigationState {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const historyRef = useRef<number[]>([]);
  const [historyLength, setHistoryLength] = useState(0);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isComplete = currentIndex >= totalQuestions;
  const canGoBack = historyLength > 0;

  const goNext = useCallback(() => {
    historyRef.current = [...historyRef.current, currentIndex];
    setHistoryLength(historyRef.current.length);
    setCurrentIndex(currentIndex + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (historyRef.current.length === 0) return;

    const newHistory = [...historyRef.current];
    const previousIndex = newHistory.pop()!;
    historyRef.current = newHistory;
    setHistoryLength(newHistory.length);
    setCurrentIndex(previousIndex);
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  };
}
