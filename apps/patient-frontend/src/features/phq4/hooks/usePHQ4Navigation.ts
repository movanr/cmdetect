/**
 * Navigation hook for PHQ-4 questionnaire
 * Simple linear navigation - no skip logic
 */

import { useState, useCallback, useRef } from "react";
import {
  PHQ4_QUESTIONNAIRE,
  PHQ4_TOTAL_QUESTIONS,
  type PHQ4Question,
} from "@cmdetect/questionnaires";

type UsePHQ4NavigationReturn = {
  currentQuestion: PHQ4Question;
  currentIndex: number;
  totalQuestions: number;
  canGoBack: boolean;
  isComplete: boolean;
  goNext: () => void;
  goBack: () => void;
};

export function usePHQ4Navigation(
  initialIndex: number = 0
): UsePHQ4NavigationReturn {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const historyRef = useRef<number[]>([]);
  const [historyLength, setHistoryLength] = useState(0);

  const currentQuestion = PHQ4_QUESTIONNAIRE.questions[currentIndex];
  const isComplete = currentIndex >= PHQ4_TOTAL_QUESTIONS;
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
    totalQuestions: PHQ4_TOTAL_QUESTIONS,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  };
}
