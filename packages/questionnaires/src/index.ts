/**
 * @cmdetect/questionnaires - Shared questionnaire definitions
 *
 * Single source of truth for questionnaire data across all frontends.
 * All text is in German.
 */

// ============================================================================
// Types
// ============================================================================
export type {
  // Common types
  EnableWhenCondition,
  AnswerOption,
  ScoredOption,
  QuestionnaireMetadata,
  QuestionnaireSubmission,
  // PHQ-4 types
  PHQ4Option,
  PHQ4QuestionId,
  PHQ4Question,
  PHQ4Questionnaire,
  PHQ4Answers,
  PHQ4Score,
  PHQ4Severity,
  PHQ4Interpretation,
  PHQ4SubscaleResult,
  // SQ types
  SQQuestionId,
  SQSectionId,
  SQSingleChoiceQuestion,
  SQCompositeNumberQuestion,
  SQMatrixRowQuestion,
  SQQuestion,
  SQSection,
  CompositeNumberAnswer,
  SQAnswerValue,
  SQAnswers,
  SQOfficeUseValue,
} from "./types";

// ============================================================================
// PHQ-4 (Patient Health Questionnaire-4)
// ============================================================================
export {
  PHQ4_QUESTIONS,
  PHQ4_QUESTION_ORDER,
  PHQ4_METADATA,
  PHQ4_TOTAL_QUESTIONS,
  PHQ4_QUESTIONNAIRE,
} from "./phq4/questions";

export { PHQ4_OPTIONS, PHQ4_OPTION_LABELS } from "./phq4/options";

export {
  calculatePHQ4Score,
  getPHQ4Interpretation,
  getSubscaleInterpretation,
} from "./phq4/scoring";

// ============================================================================
// SQ (DC/TMD Symptom Questionnaire)
// ============================================================================
export {
  SQ_SCREENS,
  SQ_QUESTION_ORDER,
  SQ_TOTAL_SCREENS,
  SQ_METADATA,
  SQ_QUESTION_LABELS,
  getScreenIndexById,
  getQuestionById,
} from "./sq/questions";

export {
  SQ_SECTIONS,
  SQ_SECTIONS_ORDER,
  SQ_SECTION_NAMES_ORDER,
  SQ_OFFICE_USE_QUESTIONS,
  getSectionForQuestion,
} from "./sq/sections";

export {
  SQ_YES_NO_OPTIONS,
  SQ_MATRIX_OPTIONS,
  SQ_PAIN_FREQUENCY_OPTIONS,
  SQ_YES_NO_LABELS,
  SQ_PAIN_FREQUENCY_LABELS,
  SQ_DURATION_LABELS,
} from "./sq/options";

export { SQ_ENABLE_WHEN } from "./sq/enableWhen";

// ============================================================================
// Utilities
// ============================================================================
export {
  evaluateCondition,
  isQuestionEnabled,
  isQuestionIdEnabled,
} from "./utils";

// ============================================================================
// Combined / Cross-questionnaire
// ============================================================================

/**
 * Questionnaire titles (German)
 */
export const QUESTIONNAIRE_TITLES: Record<string, string> = {
  "dc-tmd-sq": "DC/TMD Symptom-Fragebogen",
  "phq-4": "PHQ-4 Gesundheitsfragebogen",
};

/**
 * All supported questionnaire IDs
 */
export const QUESTIONNAIRE_IDS = ["dc-tmd-sq", "phq-4"] as const;
export type QuestionnaireId = (typeof QUESTIONNAIRE_IDS)[number];
