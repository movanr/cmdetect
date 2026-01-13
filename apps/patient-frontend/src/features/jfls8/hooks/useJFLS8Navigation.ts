/**
 * Navigation hook for JFLS-8 questionnaire
 * Simple linear navigation - no skip logic
 */

import { useState, useCallback, useRef } from "react";
import {
  JFLS8_QUESTIONNAIRE,
  JFLS8_TOTAL_QUESTIONS,
  type JFLS8Question,
} from "@cmdetect/questionnaires";

type UseJFLS8NavigationReturn = {
  currentQuestion: JFLS8Question;
  currentIndex: number;
  totalQuestions: number;
  canGoBack: boolean;
  isComplete: boolean;
  goNext: () => void;
  goBack: () => void;
};

export function useJFLS8Navigation(
  initialIndex: number = 0
): UseJFLS8NavigationReturn {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const historyRef = useRef<number[]>([]);
  const [historyLength, setHistoryLength] = useState(0);

  const currentQuestion = JFLS8_QUESTIONNAIRE.questions[currentIndex];
  const isComplete = currentIndex >= JFLS8_TOTAL_QUESTIONS;
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
    totalQuestions: JFLS8_TOTAL_QUESTIONS,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  };
}
