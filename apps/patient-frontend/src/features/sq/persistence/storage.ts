/**
 * localStorage persistence for DC/TMD Symptom Questionnaire
 * Allows patients to resume if they close/refresh the browser
 */

import type { SQAnswers } from "../model/answer";

const STORAGE_KEY = "sq_progress";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

type StoredProgress = {
  token: string;
  answers: SQAnswers;
  currentIndex: number;
  history: number[];
  timestamp: number;
  version: string;
};

/**
 * Save questionnaire progress to localStorage
 */
export function saveProgress(
  token: string,
  answers: SQAnswers,
  currentIndex: number,
  history: number[]
): void {
  const data: StoredProgress = {
    token,
    answers,
    currentIndex,
    history,
    timestamp: Date.now(),
    version: "1.0",
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // localStorage might be full or disabled
    console.warn("Failed to save progress to localStorage:", error);
  }
}

/**
 * Load questionnaire progress from localStorage
 * Returns null if no valid progress found for the given token
 */
export function loadProgress(
  token: string
): { answers: SQAnswers; currentIndex: number; history: number[] } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StoredProgress = JSON.parse(stored);

    // Validate token matches
    if (data.token !== token) {
      return null;
    }

    // Check expiry (24 hours)
    if (Date.now() - data.timestamp > EXPIRY_MS) {
      clearProgress();
      return null;
    }

    return {
      answers: data.answers,
      currentIndex: data.currentIndex,
      history: data.history ?? [],
    };
  } catch (error) {
    console.warn("Failed to load progress from localStorage:", error);
    return null;
  }
}

/**
 * Clear saved progress from localStorage
 */
export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear progress from localStorage:", error);
  }
}

/**
 * Check if there is saved progress for a token
 */
export function hasProgress(token: string): boolean {
  return loadProgress(token) !== null;
}
