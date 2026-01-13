/**
 * OBC Navigation Hook
 * Manages linear navigation through OBC questions with section awareness
 */

import { useState, useCallback, useRef } from "react";
import {
  OBC_QUESTION_ORDER,
  OBC_QUESTIONS,
  getSectionForQuestionIndex,
  type OBCQuestion,
  type OBCSectionId,
} from "@cmdetect/questionnaires";

type NavigationState = {
  currentQuestion: OBCQuestion;
  currentIndex: number;
  currentSection: OBCSectionId;
  totalQuestions: number;
  canGoBack: boolean;
  isComplete: boolean;
  showingSectionIntro: boolean;
};

export function useOBCNavigation(initialIndex = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showingSectionIntro, setShowingSectionIntro] = useState(
    // Show intro at start or when starting waking section (index 2)
    initialIndex === 0 || initialIndex === 2
  );
  const historyRef = useRef<number[]>([]);

  const totalQuestions = OBC_QUESTION_ORDER.length;
  const currentQuestionId = OBC_QUESTION_ORDER[currentIndex];
  const currentQuestion = OBC_QUESTIONS[currentQuestionId];
  const currentSection = getSectionForQuestionIndex(currentIndex);
  const isComplete = currentIndex >= totalQuestions;
  const canGoBack = historyRef.current.length > 0 || showingSectionIntro;

  const goNext = useCallback(() => {
    if (showingSectionIntro) {
      // Dismiss section intro, show first question of section
      setShowingSectionIntro(false);
      return;
    }

    // Save current position to history
    historyRef.current.push(currentIndex);

    const nextIndex = currentIndex + 1;

    // Check if we're transitioning to a new section (from sleep to waking)
    if (nextIndex < totalQuestions) {
      const nextSection = getSectionForQuestionIndex(nextIndex);
      if (nextSection !== currentSection) {
        // Show section intro for the new section
        setCurrentIndex(nextIndex);
        setShowingSectionIntro(true);
        return;
      }
    }

    setCurrentIndex(nextIndex);
  }, [currentIndex, currentSection, showingSectionIntro, totalQuestions]);

  const goBack = useCallback(() => {
    if (showingSectionIntro) {
      // Go back from section intro
      setShowingSectionIntro(false);
      if (currentIndex > 0) {
        // Go to previous question
        const prevIndex = historyRef.current.pop() ?? currentIndex - 1;
        setCurrentIndex(prevIndex);
      }
      return;
    }

    const prevIndex = historyRef.current.pop();
    if (prevIndex !== undefined) {
      // Check if going back crosses a section boundary
      const prevSection = getSectionForQuestionIndex(prevIndex);
      if (prevSection !== currentSection && currentIndex === 2) {
        // Going back from first waking question to last sleep question
        setCurrentIndex(prevIndex);
      } else {
        setCurrentIndex(prevIndex);
      }
    }
  }, [currentIndex, currentSection, showingSectionIntro]);

  const state: NavigationState = {
    currentQuestion,
    currentIndex,
    currentSection,
    totalQuestions,
    canGoBack,
    isComplete,
    showingSectionIntro,
  };

  return {
    ...state,
    goNext,
    goBack,
  };
}
