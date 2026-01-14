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

/**
 * Question types supported by the questionnaire engine
 */
export type QuestionType = "scale_0_10" | "choice" | "numeric";

/**
 * Generic section for questionnaires with section-specific options
 */
export type GenericSection = {
  id: string;
  title?: string;
  options: readonly ScoredOption[];
};

/**
 * Generic question interface for rendering
 * All questionnaire-specific question types should be compatible with this
 */
export type GenericQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  note?: string;
  section?: string; // Reference to section for section-specific options
  scaleLabels?: { min: string; max: string };
  range?: { min: number; max: number };
  unit?: string;
  skippable?: boolean; // Allow question to be skipped (e.g., JFLS scales)
};

/**
 * Generic questionnaire structure
 * All questionnaire-specific types should be compatible with this
 */
export type GenericQuestionnaire = {
  id: string;
  title: string;
  version?: string;
  instruction?: string;
  instructions?: readonly string[];
  questions: readonly GenericQuestion[];
  options?: readonly ScoredOption[];
  sections?: readonly GenericSection[]; // For questionnaires with section-specific options
};
