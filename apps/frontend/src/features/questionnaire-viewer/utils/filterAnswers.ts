/**
 * Filter SQ answers to only include enabled questions
 * Called on final submit to remove answers for disabled sub-questions
 */

import {
  SQ_SCREENS,
  isQuestionEnabled,
  type SQAnswers,
  type SQQuestionId,
} from "@cmdetect/questionnaires";

/**
 * Filter out answers for questions that are disabled by enableWhen conditions.
 * Also preserves office-use fields (_office suffix) for enabled questions.
 *
 * This function is called ONLY on final submit, not on each "No" click.
 * This prevents data loss if user accidentally changes an answer and wants to revert.
 *
 * Example:
 * - If SQ1 = "no", then SQ2, SQ3, SQ4_A-D are disabled
 * - Their answers will be filtered out on submit
 * - If user changes SQ1 back to "yes" before submit, answers are preserved
 */
export function filterEnabledAnswers(answers: SQAnswers): SQAnswers {
  // Build set of enabled question IDs
  const enabledIds = new Set<SQQuestionId>(
    SQ_SCREENS.filter((q) => isQuestionEnabled(q.enableWhen, answers)).map(
      (q) => q.id
    )
  );

  // Filter answers: keep enabled questions and their office-use fields
  const filteredEntries = Object.entries(answers).filter(([key]) => {
    // Check if it's an office-use field (e.g., "SQ8_office")
    if (key.endsWith("_office")) {
      // Get the base question ID (e.g., "SQ8" from "SQ8_office")
      const baseId = key.replace("_office", "") as SQQuestionId;
      return enabledIds.has(baseId);
    }

    // Regular question answer
    return enabledIds.has(key as SQQuestionId);
  });

  return Object.fromEntries(filteredEntries) as SQAnswers;
}
