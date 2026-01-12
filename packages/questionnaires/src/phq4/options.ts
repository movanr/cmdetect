/**
 * PHQ-4 Answer Options with Scores
 */
import type { ScoredOption } from "../types";

/**
 * PHQ-4 answer options (0-3 scale)
 * Same options apply to all 4 questions
 */
export const PHQ4_OPTIONS: ScoredOption[] = [
  { value: "0", label: "Überhaupt nicht", score: 0 },
  { value: "1", label: "An einzelnen Tagen", score: 1 },
  { value: "2", label: "An mehr als der Hälfte der Tage", score: 2 },
  { value: "3", label: "Beinahe jeden Tag", score: 3 },
];

/**
 * Lookup map for quick label access
 */
export const PHQ4_OPTION_LABELS: Record<string, string> = Object.fromEntries(
  PHQ4_OPTIONS.map((opt) => [opt.value, opt.label])
);
