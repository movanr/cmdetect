import type { QuestionInstance } from "../../model/instance/questionInstance";

export function groupByContext<
  K1 extends keyof QuestionInstance["context"],
  K2 extends keyof QuestionInstance["context"],
>(instances: QuestionInstance[], key1: K1, key2: K2) {
  const result: Record<string, Record<string, QuestionInstance[]>> = {};

  for (const instance of instances) {
    const v1 = instance.context[key1];
    const v2 = instance.context[key2];

    if (!v1 || !v2) continue;

    result[v1] ??= {};
    result[v1][v2] ??= [];
    result[v1][v2].push(instance);
  }

  return result;
}
