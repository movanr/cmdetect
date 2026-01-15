import type { QuestionContext } from "./question";

/**
 * {questionnaireSemanticId}.{questionSemanticId}:{context}
 * example: examination.pain.familiar:side=left:region=temporalis
 */
export function buildInstanceId(
  questionnaireSemanticId: string,
  questionSemanticId: string,
  context: QuestionContext
): string {
  const ctxParts = Object.entries(context)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);

  const base = `${questionnaireSemanticId}.${questionSemanticId}`;
  return ctxParts.length > 0 ? `${base}:${ctxParts.join(":")}` : base;
}
