/**
 * JFLS-8 (Jaw Functional Limitation Scale - 8 items) Scoring Utilities
 *
 * Scoring methodology:
 * - Global score = mean of available items (0-10 scale)
 * - Max 2 items may be missing for valid score
 * - Score adjusted by dividing by number of items present
 *
 * Reference values (No lifetime TMD vs Chronic TMD):
 * - Healthy: Mean = 0.16 (SE = 0.02)
 * - Chronic TMD: Mean = 1.74 (SE = 0.11)
 */

import type { JFLS8Answers, JFLS8QuestionId, JFLS8Score, JFLS8LimitationLevel } from "../types";
import { JFLS8_QUESTION_ORDER } from "./questions";

/**
 * Reference values for interpretation
 */
export const JFLS8_REFERENCE_VALUES = {
  healthy: { mean: 0.16, se: 0.02 },
  chronicTMD: { mean: 1.74, se: 0.11 },
} as const;

/**
 * Limitation level interpretations with German labels
 */
const LIMITATION_INTERPRETATIONS: Record<JFLS8LimitationLevel, { label: string }> = {
  normal: { label: "Normale Funktion" },
  mild: { label: "Leichte Einschränkung" },
  significant: { label: "Deutliche Einschränkung" },
};

/**
 * Maximum number of missing items allowed for valid score
 */
const MAX_MISSING_ITEMS = 2;

/**
 * Get numeric value from answer string
 */
function getNumericValue(value: string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Determine limitation level from global score
 * Based on reference values comparing healthy vs chronic TMD
 * - <0.5: Normal (within healthy range)
 * - 0.5-1.5: Mild/moderate limitation
 * - ≥1.5: Significant limitation (chronic TMD range)
 */
export function getJFLS8LimitationLevel(score: number): JFLS8LimitationLevel {
  if (score < 0.5) return "normal";
  if (score < 1.5) return "mild";
  return "significant";
}

/**
 * Calculate JFLS-8 global score from answers
 * Returns null if too many items are missing (>2)
 */
export function calculateJFLS8Score(answers: JFLS8Answers): JFLS8Score {
  const values: number[] = [];
  let missingCount = 0;

  for (const questionId of JFLS8_QUESTION_ORDER) {
    const value = getNumericValue(answers[questionId as JFLS8QuestionId]);
    if (value !== null) {
      values.push(value);
    } else {
      missingCount++;
    }
  }

  const answeredCount = values.length;
  const totalQuestions = JFLS8_QUESTION_ORDER.length;
  const isValid = missingCount <= MAX_MISSING_ITEMS;

  // Calculate mean if valid
  let globalScore: number | null = null;
  let limitationLevel: JFLS8LimitationLevel | null = null;
  let limitationInterpretation: { label: string } | null = null;

  if (isValid && answeredCount > 0) {
    const sum = values.reduce((acc, val) => acc + val, 0);
    globalScore = Math.round((sum / answeredCount) * 100) / 100; // Round to 2 decimals
    limitationLevel = getJFLS8LimitationLevel(globalScore);
    limitationInterpretation = LIMITATION_INTERPRETATIONS[limitationLevel];
  }

  return {
    globalScore,
    maxScore: 10,
    answeredCount,
    totalQuestions,
    missingCount,
    isValid,
    limitationLevel,
    limitationInterpretation,
  };
}
