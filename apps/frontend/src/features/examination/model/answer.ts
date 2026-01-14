export const ANSWER_VALUES = {
  YES: "yes",
  NO: "no",
} as const;

export type AnswerValue =
  | (typeof ANSWER_VALUES)[keyof typeof ANSWER_VALUES] //
  | number //
  | null; //
// extend later if needed

export type AnswerOption = {
  value: AnswerValue;
};

export const YES_NO_OPTIONS: AnswerOption[] = [
  { value: ANSWER_VALUES.YES },
  { value: ANSWER_VALUES.NO },
];

export type QuestionnaireRef = {
  id: string;
  version: string;
};

export type QuestionnaireAnswers = {
  questionnaire: QuestionnaireRef;
  answers: Record<string, AnswerValue>;
};
