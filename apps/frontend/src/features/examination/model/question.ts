import type { AnswerOption } from "./answer";
import type { Movement } from "./movement";
import type { Region } from "./region";
import type { Side } from "./side";
import type { Unit } from "./units";

export type EnableWhen = {
  dependsOn: {
    semanticId: string;
    scope?: "local" | "ancestor" | "global";
  };
  operator: "equals" | "notEquals";
  value: unknown;
};

export type QuestionContext = {
  side?: Side;
  region?: Region;
  movement?: Movement;
  // future-safe:
  // visit?: number;
  // examiner?: string;
};

export type BaseQuestion = {
  /**
   * Stable, unique per rendered question
   * Derived from semanticId + context
   *
   * Used by:
   * - RHF field name
   * - answer storage
   * - evaluation
   */
  instanceId: string;
  /**
   * Stable semantic identifier for the questionnaire
   * examples:
   * - "examination"
   * - "phq4"
   */
  questionnaireId: string;

  /**
   * Stable semantic identifier
   *
   * Used for:
   * - content lookup (i18n)
   * - diagnostic meaning
   * - analytics / rules
   */
  semanticId: string;

  /**
   * Clinical / procedural context
   * NOT for UI
   */
  context: QuestionContext;

  /**
   * Optional runtime visibility condition
   * (rarely needed if logic is procedural)
   */
  enableWhen?: EnableWhen;
};

export type ChoiceQuestion = BaseQuestion & {
  type: "choice";
  multiple: boolean;
  answerOptions: AnswerOption[];
};

export type NumericQuestion = BaseQuestion & {
  type: "numeric";
  min?: number;
  max?: number;
  unit?: Unit;
};

export type BooleanQuestion = BaseQuestion & {
  type: "boolean";
};

export type Question = ChoiceQuestion | NumericQuestion | BooleanQuestion;
