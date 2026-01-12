/**
 * Evaluates enableWhen conditions for questions
 * Used for navigation (skip disabled questions) and submit (filter disabled answers)
 */

import type { SQQuestion, EnableWhenCondition } from "../model/question";
import type { SQAnswers } from "../model/answer";
import { SQ_SCREENS } from "../data/sqQuestions";

/**
 * Evaluates a single enableWhen condition against current answers
 */
function evaluateCondition(
  condition: EnableWhenCondition,
  answers: SQAnswers
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
 * Checks if a question is enabled based on current answers
 * Questions without enableWhen are always enabled
 * Multiple conditions use AND logic (all must be true)
 */
export function isQuestionEnabled(
  question: SQQuestion,
  answers: SQAnswers
): boolean {
  if (!question.enableWhen || question.enableWhen.length === 0) {
    return true;
  }

  return question.enableWhen.every((condition) =>
    evaluateCondition(condition, answers)
  );
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
    screens.filter((q) => isQuestionEnabled(q, answers)).map((q) => q.id)
  );

  return Object.fromEntries(
    Object.entries(answers).filter(([id]) => enabledIds.has(id))
  );
}
