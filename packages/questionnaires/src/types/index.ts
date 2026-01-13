/**
 * Type exports for @cmdetect/questionnaires
 */

export type {
  EnableWhenCondition,
  AnswerOption,
  ScoredOption,
  QuestionnaireMetadata,
  QuestionnaireSubmission,
} from "./common";

export type {
  PHQ4Option,
  PHQ4QuestionId,
  PHQ4Question,
  PHQ4Questionnaire,
  PHQ4Answers,
  PHQ4Score,
  PHQ4Severity,
  PHQ4Interpretation,
  PHQ4SubscaleResult,
} from "./phq4";

export type {
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
} from "./sq";

export type {
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
} from "./gcps";

export type {
  JFLS8QuestionId,
  JFLS8Question,
  JFLS8Questionnaire,
  JFLS8Answers,
  JFLS8LimitationLevel,
  JFLS8LimitationInterpretation,
  JFLS8Score,
} from "./jfls8";

export type {
  OBCQuestionId,
  OBCSectionId,
  OBCQuestion,
  OBCSection,
  OBCAnswers,
  OBCQuestionnaire,
  OBCRiskLevel,
  OBCRiskInterpretation,
  OBCScore,
} from "./obc";

export type {
  JFLS20QuestionId,
  JFLS20Question,
  JFLS20Questionnaire,
  JFLS20Answers,
  JFLS20LimitationLevel,
  JFLS20LimitationInterpretation,
  JFLS20SubscaleId,
  JFLS20SubscaleScore,
  JFLS20Score,
} from "./jfls20";
