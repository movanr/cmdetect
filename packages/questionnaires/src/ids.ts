/**
 * Centralized questionnaire IDs - Single source of truth
 * Separate file to avoid circular dependency issues
 */

export const QUESTIONNAIRE_ID = {
  SQ: "dc-tmd-sq",
  PAIN_DRAWING: "dc-tmd-pain-drawing",
  PHQ4: "phq-4",
  GCPS_1M: "gcps-1m",
  JFLS8: "jfls-8",
  JFLS20: "jfls-20",
  OBC: "obc",
} as const;

export type QuestionnaireId = (typeof QUESTIONNAIRE_ID)[keyof typeof QUESTIONNAIRE_ID];

/**
 * All supported questionnaire IDs (derived from QUESTIONNAIRE_ID)
 */
export const QUESTIONNAIRE_IDS = Object.values(QUESTIONNAIRE_ID);

/**
 * Questionnaires enabled in the application
 * Comment/uncomment to enable/disable questionnaires across all frontends
 */
export const ENABLED_QUESTIONNAIRES = [
  QUESTIONNAIRE_ID.SQ,
  QUESTIONNAIRE_ID.PAIN_DRAWING,
  QUESTIONNAIRE_ID.PHQ4,
  QUESTIONNAIRE_ID.GCPS_1M,
  QUESTIONNAIRE_ID.JFLS8,
  // QUESTIONNAIRE_ID.JFLS20,  // Disabled - uncomment to enable
  QUESTIONNAIRE_ID.OBC,
] as const;

/**
 * Check if a questionnaire is enabled
 */
export function isQuestionnaireEnabled(id: string): boolean {
  return (ENABLED_QUESTIONNAIRES as readonly string[]).includes(id);
}
