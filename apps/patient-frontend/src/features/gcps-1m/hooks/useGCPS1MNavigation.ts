/**
 * Navigation hook for GCPS 1-Month questionnaire
 * Simple linear navigation - no skip logic
 */

import { useState, useCallback, useRef } from "react";
import {
  GCPS_1M_QUESTIONNAIRE,
  GCPS_1M_TOTAL_QUESTIONS,
  type GCPS1MQuestion,
} from "@cmdetect/questionnaires";

type UseGCPS1MNavigationReturn = {
  currentQuestion: GCPS1MQuestion;
  currentIndex: number;
  totalQuestions: number;
  canGoBack: boolean;
  isComplete: boolean;
  goNext: () => void;
  goBack: () => void;
};

export function useGCPS1MNavigation(
  initialIndex: number = 0
): UseGCPS1MNavigationReturn {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const historyRef = useRef<number[]>([]);
  const [historyLength, setHistoryLength] = useState(0);

  const currentQuestion = GCPS_1M_QUESTIONNAIRE.questions[currentIndex];
  const isComplete = currentIndex >= GCPS_1M_TOTAL_QUESTIONS;
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
    totalQuestions: GCPS_1M_TOTAL_QUESTIONS,
    canGoBack,
    isComplete,
    goNext,
    goBack,
  };
}
