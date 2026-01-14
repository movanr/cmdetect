import type { AnswerValue, QuestionnaireAnswers } from "../model/answer";

export function mapAnswersToForm(
  stored: QuestionnaireAnswers | undefined
): Record<string, AnswerValue> {
  return stored?.answers ?? {};
}
