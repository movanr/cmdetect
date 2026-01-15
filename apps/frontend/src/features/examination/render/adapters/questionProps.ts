import {
  EXAMINATION_LABELS,
  MOVEMENT_LABELS,
  REGION_LABELS,
  SIDE_LABELS,
} from "../../content/labels";
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
  /** Formatted context string, e.g. "Rechts / Temporalis" */
  contextLabel?: string;
};

/**
 * Resolves a semantic Question to display properties.
 *
 * This adapter bridges the semantic model (which has semanticId) to the
 * render layer (which needs display labels). Content is resolved from
 * the content/labels.ts constants.
 *
 * @param question - The semantic question to resolve
 * @returns Display properties for rendering
 */
export function resolveQuestionDisplay(question: Question): QuestionDisplayProps {
  const labelEntry = EXAMINATION_LABELS[question.semanticId];
  const ctx = question.context;

  // Build context label from context properties
  const contextParts: string[] = [];

  if (ctx.side) {
    const sideLabel = SIDE_LABELS[ctx.side];
    if (sideLabel) {
      contextParts.push(sideLabel);
    }
  }

  if (ctx.region) {
    const regionLabel = REGION_LABELS[ctx.region];
    if (regionLabel) {
      contextParts.push(regionLabel);
    }
  }

  if (ctx.movement) {
    const movementLabel = MOVEMENT_LABELS[ctx.movement];
    if (movementLabel) {
      contextParts.push(movementLabel);
    }
  }

  return {
    id: question.instanceId,
    label: labelEntry?.text ?? question.semanticId,
    description: labelEntry?.description,
    contextLabel: contextParts.length > 0 ? contextParts.join(" / ") : undefined,
  };
}

/**
 * Resolves just the label for a semanticId without a full question.
 * Useful for displaying standalone labels.
 */
export function resolveLabel(semanticId: string): string {
  return EXAMINATION_LABELS[semanticId]?.text ?? semanticId;
}

/**
 * Resolves a region to its display label.
 */
export function resolveRegionLabel(region: string): string {
  return REGION_LABELS[region] ?? region;
}

/**
 * Resolves a side to its display label.
 */
export function resolveSideLabel(side: string): string {
  return SIDE_LABELS[side] ?? side;
}

/**
 * Resolves a movement to its display label.
 */
export function resolveMovementLabel(movement: string): string {
  return MOVEMENT_LABELS[movement] ?? movement;
}
