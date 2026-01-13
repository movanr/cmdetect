/**
 * Generic localStorage persistence for questionnaire progress
 */

import type { QuestionnaireProgress } from "../types";

const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getStorageKey(questionnaireId: string): string {
  return `questionnaire_${questionnaireId}_progress`;
}

/**
 * Save questionnaire progress to localStorage
 */
export function saveProgress<T = Record<string, unknown>>(
  token: string,
  questionnaireId: string,
  answers: T,
  currentIndex: number
): void {
  const data: QuestionnaireProgress<T> = {
    token,
    answers,
    currentIndex,
    timestamp: Date.now(),
  };
  localStorage.setItem(getStorageKey(questionnaireId), JSON.stringify(data));
}

/**
 * Load questionnaire progress from localStorage
 */
export function loadProgress<T = Record<string, unknown>>(
  token: string,
  questionnaireId: string
): { answers: T; currentIndex: number } | null {
  try {
    const stored = localStorage.getItem(getStorageKey(questionnaireId));
    if (!stored) return null;

    const data: QuestionnaireProgress<T> = JSON.parse(stored);

    // Check token matches
    if (data.token !== token) return null;

    // Check expiry
    if (Date.now() - data.timestamp > EXPIRY_MS) {
      clearProgress(questionnaireId);
      return null;
    }

    return {
      answers: data.answers,
      currentIndex: data.currentIndex,
    };
  } catch {
    return null;
  }
}

/**
 * Clear questionnaire progress from localStorage
 */
export function clearProgress(questionnaireId: string): void {
  localStorage.removeItem(getStorageKey(questionnaireId));
}
