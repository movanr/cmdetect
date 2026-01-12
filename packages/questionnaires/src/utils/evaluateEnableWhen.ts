/**
 * Generic enableWhen evaluation utilities
 * Used for navigation (skip disabled questions) and submit (filter disabled answers)
 */
import type { EnableWhenCondition } from "../types";

/**
 * Evaluates a single enableWhen condition against current answers
 */
export function evaluateCondition(
  condition: EnableWhenCondition,
  answers: Record<string, unknown>
): boolean {
  const answer = answers[condition.questionId];

  switch (condition.operator) {
    case "=":
      return answer === condition.value;
    case "!=":
      return answer !== condition.value;
    case "exists":
      return answer !== undefined;
    default:
      return false;
  }
}

/**
 * Checks if a question is enabled based on enableWhen conditions
 * Multiple conditions use AND logic (all must be true)
 *
 * @param enableWhen - Array of conditions (or undefined for always enabled)
 * @param answers - Current answer values
 * @returns true if the question should be shown
 */
export function isQuestionEnabled(
  enableWhen: EnableWhenCondition[] | undefined,
  answers: Record<string, unknown>
): boolean {
  if (!enableWhen || enableWhen.length === 0) {
    return true;
  }

  return enableWhen.every((condition) => evaluateCondition(condition, answers));
}

/**
 * Checks if a question ID is enabled based on a conditions map
 * Useful when you have the conditions map separate from question definitions
 *
 * @param questionId - The question ID to check
 * @param enableWhenMap - Map of question IDs to their conditions
 * @param answers - Current answer values
 */
export function isQuestionIdEnabled(
  questionId: string,
  enableWhenMap: Partial<Record<string, EnableWhenCondition[]>>,
  answers: Record<string, unknown>
): boolean {
  const conditions = enableWhenMap[questionId];
  return isQuestionEnabled(conditions, answers);
}
