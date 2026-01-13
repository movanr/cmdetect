/**
 * OBC Section Definitions
 */
import type { OBCSection, OBCSectionId } from "../types";
import { OBC_SLEEP_OPTIONS, OBC_WAKING_OPTIONS } from "./options";

/**
 * OBC sections with their options
 */
export const OBC_SECTIONS: Record<OBCSectionId, OBCSection> = {
  sleep: {
    id: "sleep",
    title: "Aktivitäten während des Schlafs",
    options: [...OBC_SLEEP_OPTIONS],
  },
  waking: {
    id: "waking",
    title: "Aktivitäten im Wachzustand",
    options: [...OBC_WAKING_OPTIONS],
  },
};

/**
 * Section order
 */
export const OBC_SECTION_ORDER: OBCSectionId[] = ["sleep", "waking"];

/**
 * Get section for a question index (0-based)
 */
export function getSectionForQuestionIndex(index: number): OBCSectionId {
  // Questions 0-1 (items 1-2) are sleep, rest are waking
  return index < 2 ? "sleep" : "waking";
}
