import type { QuestionContext } from "./question";

// NOTE: instead of this, store context as first class properties, if we are storing jsonb why not store all the context as properties.

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

/* maybe need this later
export function parseInstanceId(id: string): { semanticId: string; context: QuestionContext } {
  const [semanticId, ...ctxParts] = id.split(":")
  
  const context: QuestionContext = {}
  for (const part of ctxParts) {
    const [key, value] = part.split("=")
    context[key as keyof QuestionContext] = value
  }

  return { semanticId, context }
}*/
