import type { AnswerOption } from "./answer";
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

export type Question = ChoiceQuestion | NumericQuestion;

/*

// You do not need to cast — TypeScript will narrow automatically.

function renderQuestion(question: Question) {
  switch (question.type) {
    case "choice":
      return <ChoiceQuestion question={question} />;

    case "measurement":
      return <MeasurementQuestion question={question} />;

    case "numeric":
      return <NumericQuestion question={question} />;

    default:
      assertNever(question);
  }
}

function assertNever(x: never): never {
  throw new Error("Unhandled question type");
}
  // If you add a new question type later, TypeScript will force you to update this switch.
*/

/*
answer to using one key for both content and support:
'''
This will start to hurt once:
you add tooltips vs side panels
you add “expert mode”
you add documentation-level explanations
'''

so i start with content key, add more keys later... (support, documentation...?)
*/
