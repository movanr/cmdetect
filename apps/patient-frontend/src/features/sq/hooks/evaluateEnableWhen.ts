/**
 * EnableWhen utilities for the patient frontend
 * Uses shared evaluation logic, adds submission-specific filtering
 */

import {
  SQ_SCREENS,
  isQuestionEnabled,
  type SQQuestion,
  type SQAnswers,
  type SQQuestionId,
} from "@cmdetect/questionnaires";

/**
 * Re-export the shared isQuestionEnabled function with the question wrapper
 * The shared function takes enableWhen conditions directly, but components
 * often have the full question object
 */
export function isQuestionEnabledFromQuestion(
  question: SQQuestion,
  answers: SQAnswers
): boolean {
  return isQuestionEnabled(question.enableWhen, answers);
}

/**
 * Filters answers to include only those for enabled questions
 * Used when submitting the questionnaire to exclude orphaned answers
 */
export function filterEnabledAnswers(
  answers: SQAnswers,
  screens: SQQuestion[] = SQ_SCREENS
): SQAnswers {
  const enabledIds = new Set(
    screens
      .filter((q) => isQuestionEnabled(q.enableWhen, answers))
      .map((q) => q.id)
  );

  return Object.fromEntries(
    Object.entries(answers).filter(([id]) => enabledIds.has(id as SQQuestionId))
  ) as SQAnswers;
}
