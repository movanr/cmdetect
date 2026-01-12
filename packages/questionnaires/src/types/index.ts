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
