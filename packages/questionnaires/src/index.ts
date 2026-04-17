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
  ENABLED_QUESTIONNAIRES,
  isQuestionnaireEnabled,
  QUESTIONNAIRE_ID,
  QUESTIONNAIRE_IDS,
  type QuestionnaireId,
} from "./ids";

// ============================================================================
// Types
// ============================================================================
export type {
  AnswerOption,
  CompositeNumberAnswer,
  // Common types
  EnableWhenCondition,
  GCPS1MAnswers,
  GCPS1MNumericQuestion,
  GCPS1MQuestion,
  // GCPS 1-month types
  GCPS1MQuestionId,
  GCPS1MQuestionnaire,
  GCPS1MScaleQuestion,
  GCPS1MScore,
  GCPSCPILevel,
  GCPSGrade,
  GCPSGradeInterpretation,
  GenericQuestion,
  GenericQuestionnaire,
  GenericSection,
  JFLS20Answers,
  JFLS20LimitationInterpretation,
  JFLS20LimitationLevel,
  JFLS20Question,
  // JFLS-20 types
  JFLS20QuestionId,
  JFLS20Questionnaire,
  JFLS20Score,
  JFLS20SubscaleId,
  JFLS20SubscaleScore,
  JFLS8Answers,
  JFLS8LimitationInterpretation,
  JFLS8LimitationLevel,
  JFLS8Question,
  // JFLS-8 types
  JFLS8QuestionId,
  JFLS8Questionnaire,
  JFLS8Score,
  OBCAnswers,
  OBCQuestion,
  // OBC types
  OBCQuestionId,
  OBCQuestionnaire,
  OBCRiskInterpretation,
  OBCRiskLevel,
  OBCScore,
  OBCSection,
  OBCSectionId,
  PHQ4Answers,
  PHQ4Interpretation,
  // PHQ-4 types
  PHQ4Option,
  PHQ4Question,
  PHQ4QuestionId,
  PHQ4Questionnaire,
  PHQ4Score,
  PHQ4Severity,
  PHQ4SubscaleResult,
  QuestionnaireMetadata,
  QuestionnaireSubmission,
  QuestionType,
  ScoredOption,
  SQAnswers,
  SQAnswerValue,
  SQCompositeNumberQuestion,
  SQMatrixRowQuestion,
  SQOfficeUseValue,
  SQQuestion,
  // SQ types
  SQQuestionId,
  SQSection,
  SQSectionId,
  SQSingleChoiceQuestion,
} from "./types";

// ============================================================================
// PHQ-4 (Patient Health Questionnaire-4)
// ============================================================================
export {
  PHQ4_METADATA,
  PHQ4_QUESTION_ORDER,
  PHQ4_QUESTIONNAIRE,
  PHQ4_QUESTIONS,
  PHQ4_TOTAL_QUESTIONS,
} from "./phq4/questions";

export { PHQ4_OPTION_LABELS, PHQ4_OPTIONS } from "./phq4/options";

export {
  calculatePHQ4Score,
  getPHQ4Interpretation,
  getSubscaleInterpretation,
} from "./phq4/scoring";

// ============================================================================
// SQ (DC/TMD Symptom Questionnaire)
// ============================================================================
export {
  getQuestionById,
  getScreenIndexById,
  SQ_DISPLAY_IDS,
  SQ_METADATA,
  SQ_QUESTION_LABELS,
  SQ_QUESTION_ORDER,
  SQ_QUESTION_SHORT_LABELS,
  SQ_SCREENS,
  SQ_TOTAL_SCREENS,
} from "./sq/questions";

export {
  getSectionForQuestion,
  SQ_OFFICE_USE_QUESTIONS,
  SQ_SECTION_NAMES_ORDER,
  SQ_SECTIONS,
  SQ_SECTIONS_ORDER,
} from "./sq/sections";

export {
  SQ_DURATION_LABELS,
  SQ_MATRIX_OPTIONS,
  SQ_PAIN_FREQUENCY_LABELS,
  SQ_PAIN_FREQUENCY_OPTIONS,
  SQ_YES_NO_LABELS,
  SQ_YES_NO_OPTIONS,
} from "./sq/options";

export { SQ_ENABLE_WHEN } from "./sq/enableWhen";

// ============================================================================
// GCPS 1-Month (Graded Chronic Pain Scale - 1 Month Version)
// ============================================================================
export {
  GCPS_1M_METADATA,
  GCPS_1M_QUESTION_LABELS,
  GCPS_1M_QUESTION_ORDER,
  GCPS_1M_QUESTIONNAIRE,
  GCPS_1M_QUESTIONS,
  GCPS_1M_TOTAL_QUESTIONS,
} from "./gcps-1m/questions";

export {
  GCPS_1M_6_MONTH_DAYS_CONFIG,
  GCPS_1M_DAYS_CONFIG,
  GCPS_1M_INTERFERENCE_LABELS,
  GCPS_1M_INTERFERENCE_SCALE_OPTIONS,
  GCPS_1M_OPTION_LABELS,
  GCPS_1M_PAIN_LABELS,
  GCPS_1M_PAIN_SCALE_OPTIONS,
} from "./gcps-1m/options";

export {
  calculateCPI,
  calculateGCPS1MScore,
  calculateInterferenceScore,
  determineGrade,
  getCPILevel,
  getDisabilityDaysPoints,
  getInterferencePoints,
} from "./gcps-1m/scoring";

// ============================================================================
// JFLS-8 (Jaw Functional Limitation Scale - 8 items)
// ============================================================================
export {
  JFLS8_INSTRUCTIONS,
  JFLS8_METADATA,
  JFLS8_QUESTION_LABELS,
  JFLS8_QUESTION_ORDER,
  JFLS8_QUESTIONNAIRE,
  JFLS8_QUESTIONS,
  JFLS8_TOTAL_QUESTIONS,
} from "./jfls8/questions";

export { JFLS8_OPTION_LABELS, JFLS8_SCALE_LABELS, JFLS8_SCALE_OPTIONS } from "./jfls8/options";

export {
  calculateJFLS8Score,
  getJFLS8LimitationLevel,
  JFLS8_REFERENCE_VALUES,
} from "./jfls8/scoring";

// ============================================================================
// OBC (Oral Behaviors Checklist)
// ============================================================================
export {
  OBC_INSTRUCTIONS,
  OBC_METADATA,
  OBC_QUESTION_LABELS,
  OBC_QUESTION_ORDER,
  OBC_QUESTIONNAIRE,
  OBC_QUESTIONS,
  OBC_TOTAL_QUESTIONS,
} from "./obc/questions";

export {
  OBC_SLEEP_OPTION_LABELS,
  OBC_SLEEP_OPTIONS,
  OBC_WAKING_OPTION_LABELS,
  OBC_WAKING_OPTIONS,
} from "./obc/options";

export { getSectionForQuestionIndex, OBC_SECTION_ORDER, OBC_SECTIONS } from "./obc/sections";

export { calculateOBCScore, getOBCRiskLevel } from "./obc/scoring";

// ============================================================================
// JFLS-20 (Jaw Functional Limitation Scale - 20 items)
// ============================================================================
export {
  JFLS20_INSTRUCTIONS,
  JFLS20_METADATA,
  JFLS20_QUESTION_LABELS,
  JFLS20_QUESTION_ORDER,
  JFLS20_QUESTIONNAIRE,
  JFLS20_QUESTIONS,
  JFLS20_TOTAL_QUESTIONS,
} from "./jfls20/questions";

export { JFLS20_OPTION_LABELS, JFLS20_SCALE_LABELS, JFLS20_SCALE_OPTIONS } from "./jfls20/options";

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
export { evaluateCondition, isQuestionEnabled, isQuestionIdEnabled } from "./utils";

// ============================================================================
// Combined / Cross-questionnaire
// ============================================================================
import { QUESTIONNAIRE_ID } from "./ids";

/**
 * Questionnaire titles (German)
 */
export const QUESTIONNAIRE_TITLES: Record<string, string> = {
  [QUESTIONNAIRE_ID.SQ]: "DC/TMD Symptom-Fragebogen",
  [QUESTIONNAIRE_ID.PAIN_DRAWING]: "Schmerzzeichnung",
  [QUESTIONNAIRE_ID.PHQ4]: "PHQ-4 — Patient Health Questionnaire-4",
  [QUESTIONNAIRE_ID.GCPS_1M]: "GCS — Graduierung chronischer Schmerzen",
  [QUESTIONNAIRE_ID.JFLS8]: "JFLS-8 — Jaw Functional Limitation Scale",
  [QUESTIONNAIRE_ID.JFLS20]: "JFLS-20 — Jaw Functional Limitation Scale (erweitert)",
  [QUESTIONNAIRE_ID.OBC]: "OBC — Oral Behaviors Checklist",
};

// ============================================================================
// Validation (Zod schemas for runtime validation)
// ============================================================================
export {
  checkSQCompletion,
  // Common schemas
  CompositeNumberAnswerSchema,
  // Generic schemas
  GenericAnswersSchema,
  getAnswersSchema,
  isSQScreeningNegative,
  LikertSchema,
  // Manual score entry schema
  ManualScoreEntrySchema,
  OptionalAnswersSchema,
  // Registry and helpers
  questionnaireSchemas,
  // Response data schema
  ResponseDataSchema,
  // SQ schemas
  SQAnswersSchema,
  SQPainFrequencySchema,
  validateQuestionnaireResponse,
  YesNoSchema,
  type GenericAnswers,
  type ManualScoreEntry,
  type ResponseData,
  type SQPainFrequency,
  type ValidationResult,
  // Types (only new ones not already in ./types)
  type YesNo,
} from "./validation";

// ============================================================================
// Manual score labels (German display labels for practitioner-entered enum fields)
// ============================================================================
export {
  GCPS_GRADE_LABELS,
  GCPS_GRADE_OPTIONS,
  OBC_SEVERITY_LABELS,
  OBC_SEVERITY_OPTIONS,
  PAIN_DRAWING_SEVERITY_LABELS,
  PAIN_DRAWING_SEVERITY_OPTIONS,
  PHQ4_SEVERITY_LABELS,
  PHQ4_SEVERITY_OPTIONS,
  resolveLabel,
  type LabelOption,
} from "./manual-score-labels";

// ============================================================================
// Manual score display formatter (shared by anamnesis print + Befundbericht)
// ============================================================================
export { formatManualScoreLine } from "./format-manual-score";

// ============================================================================
// Score Schemas (Zod schemas - single source of truth for score types)
// ============================================================================
export {
  GCPS1MScoreSchema,
  GCPSCPILevelSchema,
  GCPSGradeInterpretationSchema,
  // GCPS schemas
  GCPSGradeSchema,
  JFLS20LimitationInterpretationSchema,
  // JFLS-20 schemas
  JFLS20LimitationLevelSchema,
  JFLS20ScoreSchema,
  JFLS20SubscaleScoreSchema,
  JFLS8LimitationInterpretationSchema,
  // JFLS-8 schemas
  JFLS8LimitationLevelSchema,
  JFLS8ScoreSchema,
  OBCRiskInterpretationSchema,
  // OBC schemas
  OBCRiskLevelSchema,
  OBCScoreSchema,
  PainDrawingElementCountsSchema,
  // Pain Drawing schemas
  PainDrawingImageIdSchema,
  PainDrawingInterpretationSchema,
  PainDrawingPatternsSchema,
  PainDrawingRiskLevelSchema,
  PainDrawingScoreSchema,
  PHQ4InterpretationSchema,
  PHQ4ScoreSchema,
  // PHQ-4 schemas
  PHQ4SeveritySchema,
  PHQ4SubscaleResultSchema,
} from "./schemas";
