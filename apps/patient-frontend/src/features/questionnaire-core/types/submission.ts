/**
 * Shared types for questionnaire submission
 */

/**
 * Data submitted to the backend for a questionnaire response
 */
export interface QuestionnaireSubmission {
  questionnaire_id: string;
  questionnaire_version: string;
  answers: Record<string, unknown>;
}

/**
 * Metadata that each questionnaire feature exports
 */
export interface QuestionnaireMetadata {
  id: string;
  version: string;
  title: string;
}
