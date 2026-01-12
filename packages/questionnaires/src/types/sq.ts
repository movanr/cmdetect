/**
 * DC/TMD Symptom Questionnaire (SQ) types
 */
import type { EnableWhenCondition, AnswerOption } from "./common";

/**
 * All SQ question IDs
 */
export type SQQuestionId =
  | "SQ1"
  | "SQ2"
  | "SQ3"
  | "SQ4_A"
  | "SQ4_B"
  | "SQ4_C"
  | "SQ4_D"
  | "SQ5"
  | "SQ6"
  | "SQ7_A"
  | "SQ7_B"
  | "SQ7_C"
  | "SQ7_D"
  | "SQ8"
  | "SQ9"
  | "SQ10"
  | "SQ11"
  | "SQ12"
  | "SQ13"
  | "SQ14";

/**
 * SQ section IDs
 */
export type SQSectionId =
  | "pain"
  | "headache"
  | "joint_noises"
  | "closed_locking"
  | "open_locking";

/**
 * Single choice question (Yes/No or multiple options)
 */
export type SQSingleChoiceQuestion = {
  id: SQQuestionId;
  type: "single_choice";
  text: string;
  note?: string;
  options: AnswerOption[];
  enableWhen?: EnableWhenCondition[];
};

/**
 * Composite number question (years and months fields)
 */
export type SQCompositeNumberQuestion = {
  id: SQQuestionId;
  type: "composite_number";
  text: string;
  fields: {
    years: { id: string; label: string };
    months: { id: string; label: string };
  };
  enableWhen?: EnableWhenCondition[];
};

/**
 * Matrix row question (expanded from matrix questions)
 */
export type SQMatrixRowQuestion = {
  id: SQQuestionId;
  type: "matrix_row";
  parentId: string;
  text: string;
  rowText: string;
  enableWhen?: EnableWhenCondition[];
};

/**
 * Union type for all SQ question types
 */
export type SQQuestion =
  | SQSingleChoiceQuestion
  | SQCompositeNumberQuestion
  | SQMatrixRowQuestion;

/**
 * SQ section definition
 */
export type SQSection = {
  id: SQSectionId;
  name: string; // German
  questionIds: SQQuestionId[];
};

/**
 * Composite number answer (for duration questions)
 */
export type CompositeNumberAnswer = {
  years?: number;
  months?: number;
};

/**
 * SQ answer value (string for choices, object for duration)
 */
export type SQAnswerValue = string | CompositeNumberAnswer;

/**
 * SQ answers map
 */
export type SQAnswers = Partial<Record<SQQuestionId, SQAnswerValue>>;

/**
 * Office use field values (for practitioner confirmation)
 */
export type SQOfficeUseValue = {
  R?: boolean; // Right
  L?: boolean; // Left
  DNK?: boolean; // Did not know / Unclear
};
