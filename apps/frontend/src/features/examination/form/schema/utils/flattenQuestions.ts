import type { Question } from "../../../model/question";

export function flattenQuestions(questions: Question[]): Question[] {
  return questions.flatMap((q) => (q.type === "group" ? flattenQuestions(q.questions) : q));
}
