/**
 * Storage Mapper
 *
 * Maps between React Hook Form values (flat, keyed by instanceId)
 * and storage format (structured, with context as fields).
 */

import type { Movement } from "../model/movement";
import type { Question } from "../model/question";
import type { Region } from "../model/region";
import type { Side } from "../model/side";
import { buildInstanceId } from "../model/questionInstance";

/**
 * Stored answer with structured context (for JSONB storage).
 */
export type StoredAnswer = {
  semanticId: string;
  side?: Side;
  region?: Region;
  movement?: Movement;
  value: string | number | boolean | null;
};

/**
 * Form values as flat record keyed by instanceId.
 */
export type FormValues = Record<string, string | number | boolean | null | undefined>;

/**
 * Maps form values to storage format.
 *
 * @param values - Flat form values keyed by instanceId
 * @param questions - Question definitions (provides context for each instanceId)
 * @returns Array of structured answers for storage
 */
export function mapFormToStorage(
  values: FormValues,
  questions: Question[]
): StoredAnswer[] {
  const answers: StoredAnswer[] = [];

  for (const question of questions) {
    const value = values[question.instanceId];

    // Skip undefined/unanswered questions
    if (value === undefined) continue;

    const answer: StoredAnswer = {
      semanticId: question.semanticId,
      value,
    };

    // Add context fields if present
    if (question.context.side) {
      answer.side = question.context.side;
    }
    if (question.context.region) {
      answer.region = question.context.region;
    }
    if (question.context.movement) {
      answer.movement = question.context.movement;
    }

    answers.push(answer);
  }

  return answers;
}

/**
 * Maps storage format back to form values.
 *
 * @param answers - Structured answers from storage
 * @param questionnaireId - Questionnaire ID for building instanceIds
 * @returns Flat form values keyed by instanceId
 */
export function mapStorageToForm(
  answers: StoredAnswer[],
  questionnaireId: string
): FormValues {
  const values: FormValues = {};

  for (const answer of answers) {
    const instanceId = buildInstanceId(questionnaireId, answer.semanticId, {
      side: answer.side,
      region: answer.region,
      movement: answer.movement,
    });

    values[instanceId] = answer.value;
  }

  return values;
}

/**
 * Filters answers by context criteria.
 * Useful for extracting subsets (e.g., all right-side pain answers).
 */
export function filterAnswers(
  answers: StoredAnswer[],
  criteria: Partial<Pick<StoredAnswer, "semanticId" | "side" | "region" | "movement">>
): StoredAnswer[] {
  return answers.filter((answer) => {
    if (criteria.semanticId && answer.semanticId !== criteria.semanticId) return false;
    if (criteria.side && answer.side !== criteria.side) return false;
    if (criteria.region && answer.region !== criteria.region) return false;
    if (criteria.movement && answer.movement !== criteria.movement) return false;
    return true;
  });
}

/**
 * Gets a single answer by full context match.
 */
export function getAnswer(
  answers: StoredAnswer[],
  semanticId: string,
  context: { side?: string; region?: string; movement?: string } = {}
): StoredAnswer | undefined {
  return answers.find(
    (a) =>
      a.semanticId === semanticId &&
      a.side === context.side &&
      a.region === context.region &&
      a.movement === context.movement
  );
}
