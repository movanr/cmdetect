/**
 * Question type definitions for the DC/TMD Symptom Questionnaire
 * Uses discriminated unions for type-safe rendering
 */

/**
 * Condition for enabling a question based on another question's answer
 * Multiple conditions use AND logic (all must be true)
 */
export type EnableWhenCondition = {
  questionId: string;
  operator: "=" | "!=" | "exists";
  value?: string;
};

export type SingleChoiceQuestion = {
  id: string;
  type: "single_choice";
  text: string;
  note?: string;
  options: Array<{ value: string; label: string }>;
  enableWhen?: EnableWhenCondition[];
};

export type CompositeNumberQuestion = {
  id: string;
  type: "composite_number";
  text: string;
  fields: {
    years: { id: string; label: string };
    months: { id: string; label: string };
  };
  enableWhen?: EnableWhenCondition[];
};

export type MatrixRowQuestion = {
  id: string;
  type: "matrix_row";
  parentId: string;
  text: string; // Parent question context
  rowText: string; // This row's specific text
  enableWhen?: EnableWhenCondition[];
};

export type SQQuestion =
  | SingleChoiceQuestion
  | CompositeNumberQuestion
  | MatrixRowQuestion;
