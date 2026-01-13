/**
 * OBC Progress Persistence
 * Saves progress to localStorage for resuming later
 */

import type { OBCAnswers } from "@cmdetect/questionnaires";

const STORAGE_KEY = "obc_progress";
const EXPIRY_HOURS = 24;

type StoredProgress = {
  token: string;
  answers: OBCAnswers;
  currentIndex: number;
  timestamp: number;
};

/**
 * Save current progress
 */
export function saveProgress(
  token: string,
  answers: OBCAnswers,
  currentIndex: number
): void {
  const data: StoredProgress = {
    token,
    answers,
    currentIndex,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Load saved progress if valid
 */
export function loadProgress(token: string): {
  answers: OBCAnswers;
  currentIndex: number;
} | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StoredProgress = JSON.parse(stored);

    // Check token matches
    if (data.token !== token) return null;

    // Check not expired
    const expiryMs = EXPIRY_HOURS * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > expiryMs) {
      clearProgress();
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
 * Clear saved progress
 */
export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
