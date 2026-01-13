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
  QuestionType,
  GenericSection,
  GenericQuestion,
  GenericQuestionnaire,
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
  JFLS8LimitationLevel,
  JFLS8LimitationInterpretation,
  JFLS8Score,
  // OBC types
  OBCQuestionId,
  OBCSectionId,
  OBCQuestion,
  OBCSection,
  OBCAnswers,
  OBCQuestionnaire,
  OBCRiskLevel,
  OBCRiskInterpretation,
  OBCScore,
  // JFLS-20 types
  JFLS20QuestionId,
  JFLS20Question,
  JFLS20Questionnaire,
  JFLS20Answers,
  JFLS20LimitationLevel,
  JFLS20LimitationInterpretation,
  JFLS20SubscaleId,
  JFLS20SubscaleScore,
  JFLS20Score,
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

export {
  calculateJFLS8Score,
  getJFLS8LimitationLevel,
  JFLS8_REFERENCE_VALUES,
} from "./jfls8/scoring";

// ============================================================================
// OBC (Oral Behaviors Checklist)
// ============================================================================
export {
  OBC_QUESTIONS,
  OBC_QUESTION_ORDER,
  OBC_METADATA,
  OBC_INSTRUCTIONS,
  OBC_TOTAL_QUESTIONS,
  OBC_QUESTIONNAIRE,
  OBC_QUESTION_LABELS,
} from "./obc/questions";

export {
  OBC_SLEEP_OPTIONS,
  OBC_WAKING_OPTIONS,
  OBC_SLEEP_OPTION_LABELS,
  OBC_WAKING_OPTION_LABELS,
} from "./obc/options";

export {
  OBC_SECTIONS,
  OBC_SECTION_ORDER,
  getSectionForQuestionIndex,
} from "./obc/sections";

export { calculateOBCScore, getOBCRiskLevel } from "./obc/scoring";

// ============================================================================
// JFLS-20 (Jaw Functional Limitation Scale - 20 items)
// ============================================================================
export {
  JFLS20_QUESTIONS,
  JFLS20_QUESTION_ORDER,
  JFLS20_METADATA,
  JFLS20_INSTRUCTIONS,
  JFLS20_TOTAL_QUESTIONS,
  JFLS20_QUESTIONNAIRE,
  JFLS20_QUESTION_LABELS,
} from "./jfls20/questions";

export {
  JFLS20_SCALE_OPTIONS,
  JFLS20_SCALE_LABELS,
  JFLS20_OPTION_LABELS,
} from "./jfls20/options";

export {
  calculateJFLS20Score,
  getJFLS20LimitationLevel,
  getJFLS20SubscaleItems,
  JFLS20_REFERENCE_VALUES,
  JFLS20_SUBSCALE_LABELS,
} from "./jfls20/scoring";

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
  "jfls-20": "JFLS-20 - Kieferfunktions-Einschränkungsskala (erweitert)",
  "obc": "OBC - Oral Behaviors Checklist",
};

/**
 * All supported questionnaire IDs
 */
export const QUESTIONNAIRE_IDS = ["dc-tmd-sq", "phq-4", "gcps-1m", "jfls-8", "jfls-20", "obc"] as const;
export type QuestionnaireId = (typeof QUESTIONNAIRE_IDS)[number];
