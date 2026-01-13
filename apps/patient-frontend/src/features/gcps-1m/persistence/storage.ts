/**
 * localStorage persistence for GCPS 1-Month questionnaire progress
 */

import type { GCPS1MAnswers } from "@cmdetect/questionnaires";

const STORAGE_KEY = "gcps_1m_progress";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

type StoredProgress = {
  token: string;
  answers: GCPS1MAnswers;
  currentIndex: number;
  timestamp: number;
};

export function saveProgress(
  token: string,
  answers: GCPS1MAnswers,
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

export function loadProgress(
  token: string
): { answers: GCPS1MAnswers; currentIndex: number } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StoredProgress = JSON.parse(stored);

    // Check token matches
    if (data.token !== token) return null;

    // Check expiry
    if (Date.now() - data.timestamp > EXPIRY_MS) {
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

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
