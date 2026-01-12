/**
 * Answer type definitions for the DC/TMD Symptom Questionnaire
 */

export type CompositeNumberAnswer = {
  years?: number;
  months?: number;
};

export type SQAnswerValue = string | CompositeNumberAnswer;

export type SQAnswers = Record<string, SQAnswerValue>;
