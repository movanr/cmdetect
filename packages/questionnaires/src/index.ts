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
  // GCPS 1-month types
  GCPS1MQuestionId,
  GCPS1MScaleQuestion,
  GCPS1MNumericQuestion,
  GCPS1MQuestion,
  GCPS1MQuestionnaire,
  GCPS1MAnswers,
  GCPS1MScore,
  GCPSGrade,
  GCPSGradeInterpretation,
  GCPSCPILevel,
  // JFLS-8 types
  JFLS8QuestionId,
  JFLS8Question,
  JFLS8Questionnaire,
  JFLS8Answers,
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
// GCPS 1-Month (Graded Chronic Pain Scale - 1 Month Version)
// ============================================================================
export {
  GCPS_1M_QUESTIONS,
  GCPS_1M_QUESTION_ORDER,
  GCPS_1M_METADATA,
  GCPS_1M_TOTAL_QUESTIONS,
  GCPS_1M_QUESTIONNAIRE,
  GCPS_1M_QUESTION_LABELS,
} from "./gcps-1m/questions";

export {
  GCPS_1M_PAIN_SCALE_OPTIONS,
  GCPS_1M_INTERFERENCE_SCALE_OPTIONS,
  GCPS_1M_PAIN_LABELS,
  GCPS_1M_INTERFERENCE_LABELS,
  GCPS_1M_DAYS_CONFIG,
  GCPS_1M_6_MONTH_DAYS_CONFIG,
  GCPS_1M_OPTION_LABELS,
} from "./gcps-1m/options";

export {
  calculateGCPS1MScore,
  calculateCPI,
  calculateInterferenceScore,
  getInterferencePoints,
  getDisabilityDaysPoints,
  getCPILevel,
  determineGrade,
} from "./gcps-1m/scoring";

// ============================================================================
// JFLS-8 (Jaw Functional Limitation Scale - 8 items)
// ============================================================================
export {
  JFLS8_QUESTIONS,
  JFLS8_QUESTION_ORDER,
  JFLS8_METADATA,
  JFLS8_INSTRUCTIONS,
  JFLS8_TOTAL_QUESTIONS,
  JFLS8_QUESTIONNAIRE,
  JFLS8_QUESTION_LABELS,
} from "./jfls8/questions";

export {
  JFLS8_SCALE_OPTIONS,
  JFLS8_SCALE_LABELS,
  JFLS8_OPTION_LABELS,
} from "./jfls8/options";

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
  "gcps-1m": "GCPS - Stufenskala für chronische Schmerzen",
  "jfls-8": "JFLS-8 - Kieferfunktions-Einschränkungsskala",
};

/**
 * All supported questionnaire IDs
 */
export const QUESTIONNAIRE_IDS = ["dc-tmd-sq", "phq-4", "gcps-1m", "jfls-8"] as const;
export type QuestionnaireId = (typeof QUESTIONNAIRE_IDS)[number];
