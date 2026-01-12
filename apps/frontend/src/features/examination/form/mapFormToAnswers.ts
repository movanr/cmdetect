import type { AnswerValue, QuestionnaireAnswers, QuestionnaireRef } from "../model/answer";

export function mapFormToAnswers(
  values: Record<string, unknown>,
  questionnaire: QuestionnaireRef
): QuestionnaireAnswers {
  return {
    questionnaire,
    answers: values as Record<string, AnswerValue>,
  };
}

/*
Yes — this cast is intentional and correct:

Zod already validated

This is a boundary crossing

Over-typing here adds no value
*/
