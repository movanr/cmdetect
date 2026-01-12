/**
 * Zod schema for SQ review validation
 * Ensures all office-use confirmations are complete before submission
 */

import {
  SQ_OFFICE_USE_QUESTIONS,
  SQ_ENABLE_WHEN,
  isQuestionIdEnabled,
  type SQAnswers,
} from "@cmdetect/questionnaires";

/**
 * Validation result for office-use confirmations
 */
export interface SQReviewValidationResult {
  success: boolean;
  errors: {
    questionId: string;
    message: string;
  }[];
}

/**
 * Validate that all office-use questions with "yes" answers have R/L/DNK confirmation
 *
 * @param answers - The form answers to validate
 * @returns Validation result with any errors
 */
export function validateSQReview(answers: SQAnswers): SQReviewValidationResult {
  const errors: { questionId: string; message: string }[] = [];

  // Check each office-use question
  for (const questionId of SQ_OFFICE_USE_QUESTIONS) {
    // Skip if question is disabled by enableWhen logic
    if (!isQuestionIdEnabled(questionId, SQ_ENABLE_WHEN, answers)) {
      continue;
    }

    const answer = answers[questionId as keyof SQAnswers];

    // Only validate if answer is "yes"
    if (answer !== "yes") {
      continue;
    }

    // Check office-use confirmation
    const officeUseKey = `${questionId}_office` as keyof SQAnswers;
    const officeUse = answers[officeUseKey] as
      | { R?: boolean; L?: boolean; DNK?: boolean }
      | undefined;

    const hasConfirmation = officeUse?.R || officeUse?.L || officeUse?.DNK;

    if (!hasConfirmation) {
      errors.push({
        questionId,
        message: `${questionId}: Bitte Seite bestätigen (Rechts/Links/Unklar)`,
      });
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Get count of pending office-use confirmations
 */
export function countPendingConfirmations(answers: SQAnswers): number {
  let count = 0;

  for (const questionId of SQ_OFFICE_USE_QUESTIONS) {
    if (!isQuestionIdEnabled(questionId, SQ_ENABLE_WHEN, answers)) {
      continue;
    }

    const answer = answers[questionId as keyof SQAnswers];
    if (answer !== "yes") {
      continue;
    }

    const officeUseKey = `${questionId}_office` as keyof SQAnswers;
    const officeUse = answers[officeUseKey] as
      | { R?: boolean; L?: boolean; DNK?: boolean }
      | undefined;

    if (!officeUse?.R && !officeUse?.L && !officeUse?.DNK) {
      count++;
    }
  }

  return count;
}
