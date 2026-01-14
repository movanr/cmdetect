import type { QuestionInstance } from "../../model/instance/questionInstance";

export function groupInstancesByContext(
  instances: QuestionInstance[],
  keys: (keyof QuestionInstance["context"])[]
): any {
  if (keys.length === 0) {
    return instances;
  }

  const [currentKey, ...restKeys] = keys;
  const grouped: Record<string, QuestionInstance[]> = {};

  for (const instance of instances) {
    const value = instance.context[currentKey];
    if (!value) continue;

    grouped[value] ??= [];
    grouped[value].push(instance);
  }

  const result: Record<string, any> = {};
  for (const [value, group] of Object.entries(grouped)) {
    result[value] = groupInstancesByContext(group, restKeys);
  }

  return result;
}
