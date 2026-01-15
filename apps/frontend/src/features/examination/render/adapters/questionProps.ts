import { getLabel } from "../../content/labels";
import type { Question } from "../../model/question";

/**
 * Display properties resolved from the semantic question model.
 * Used by render components to display labels without coupling to the content layer.
 */
export type QuestionDisplayProps = {
  /** instanceId - used for form field binding */
  id: string;
  /** Resolved label text from content layer */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Formatted context string, e.g. "Rechte Seite / Temporalis" */
  contextLabel?: string;
};

/**
 * Resolves a semantic Question to display properties.
 *
 * This adapter bridges the semantic model (which has semanticId) to the
 * render layer (which needs display labels). Content is resolved from
 * the content/labels.ts via getLabel().
 *
 * @param question - The semantic question to resolve
 * @returns Display properties for rendering
 */
export function resolveQuestionDisplay(question: Question): QuestionDisplayProps {
  const ctx = question.context;

  // Build context label from context properties
  const contextParts: string[] = [];

  if (ctx.side) {
    contextParts.push(getLabel(ctx.side));
  }

  if (ctx.region) {
    contextParts.push(getLabel(ctx.region));
  }

  if (ctx.movement) {
    contextParts.push(getLabel(ctx.movement));
  }

  return {
    id: question.instanceId,
    label: getLabel(question.semanticId),
    description: undefined, // No descriptions for now - can be added later
    contextLabel: contextParts.length > 0 ? contextParts.join(" / ") : undefined,
  };
}
