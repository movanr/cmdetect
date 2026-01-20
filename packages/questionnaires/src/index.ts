/**
 * @cmdetect/questionnaires - Shared questionnaire definitions
 *
 * Single source of truth for questionnaire data across all frontends.
 * All text is in German.
 */

// ============================================================================
// IDs and Config (imported first to avoid circular dependencies)
// ============================================================================
export {
  QUESTIONNAIRE_ID,
  QUESTIONNAIRE_IDS,
  ENABLED_QUESTIONNAIRES,
  isQuestionnaireEnabled,
  type QuestionnaireId,
} from "./ids";

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
  // PDF Export types
  AnamnesisExportData,
  AnamnesisExportMetadata,
  AnamnesisExportPatient,
  AnamnesisExportQuestionnaires,
  SQExportData,
  PainDrawingExportData,
  PainDrawingScore,
  PainDrawingImageId,
  PainDrawingRiskLevel,
  PainDrawingElementCounts,
  PainDrawingPatterns,
  PainDrawingInterpretation,
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
  SQ_DISPLAY_IDS,
  SQ_QUESTION_SHORT_LABELS,
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
import { QUESTIONNAIRE_ID } from "./ids";

/**
 * Questionnaire titles (German)
 */
export const QUESTIONNAIRE_TITLES: Record<string, string> = {
  [QUESTIONNAIRE_ID.SQ]: "DC/TMD Symptom-Fragebogen",
  [QUESTIONNAIRE_ID.PHQ4]: "PHQ-4 Gesundheitsfragebogen",
  [QUESTIONNAIRE_ID.GCPS_1M]: "GCPS - Stufenskala für chronische Schmerzen",
  [QUESTIONNAIRE_ID.JFLS8]: "JFLS-8 - Kieferfunktions-Einschränkungsskala",
  [QUESTIONNAIRE_ID.JFLS20]: "JFLS-20 - Kieferfunktions-Einschränkungsskala (erweitert)",
  [QUESTIONNAIRE_ID.OBC]: "OBC - Oral Behaviors Checklist",
};

// ============================================================================
// Validation (Zod schemas for runtime validation)
// ============================================================================
export {
  // Common schemas
  CompositeNumberAnswerSchema,
  YesNoSchema,
  LikertSchema,
  // SQ schemas
  SQAnswersSchema,
  SQPainFrequencySchema,
  isSQScreeningNegative,
  // Generic schemas
  GenericAnswersSchema,
  OptionalAnswersSchema,
  // Response data schema
  ResponseDataSchema,
  // Registry and helpers
  questionnaireSchemas,
  getAnswersSchema,
  validateQuestionnaireResponse,
  checkSQCompletion,
  // Types (only new ones not already in ./types)
  type YesNo,
  type SQPainFrequency,
  type GenericAnswers,
  type ResponseData,
  type ValidationResult,
} from "./validation";
