/**
 * Common types shared across questionnaires
 */

/**
 * EnableWhen condition for conditional questions
 * Supports =, !=, and exists operators
 */
export type EnableWhenCondition = {
  questionId: string;
  operator: "=" | "!=" | "exists";
  value?: string;
};

/**
 * Generic answer option type
 */
export type AnswerOption<T = string> = {
  value: T;
  label: string; // German text
};

/**
 * Option with score (for scored questionnaires like PHQ-4)
 */
export type ScoredOption = AnswerOption & {
  score: number;
};

/**
 * Questionnaire metadata
 */
export type QuestionnaireMetadata = {
  id: string;
  title: string; // German
  version: string;
  instruction?: string; // German
};

/**
 * Questionnaire submission structure (matches FHIR QuestionnaireResponse)
 */
export type QuestionnaireSubmission = {
  questionnaire_id: string;
  questionnaire_version: string;
  answers: Record<string, unknown>;
};
