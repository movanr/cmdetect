import type { TransitionType } from "../types";

export const ARROW_COLORS: Record<TransitionType, string> = {
  positive: "#3b82f6", // blue-500 (matches positive criteria nodes)
  negative: "#9ca3af", // gray-400 (matches negative criteria nodes)
  unconditional: "#000000", // black (for unconditional transitions)
};

export function getArrowColor(type: TransitionType): string {
  return ARROW_COLORS[type];
}
