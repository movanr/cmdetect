/**
 * OBC Answer Options
 * Two different scales for sleep vs waking activities
 */

/**
 * Sleep activities scale (items 1-2)
 * Night-based frequency
 */
export const OBC_SLEEP_OPTIONS = [
  { value: "0", label: "Nie", score: 0 },
  { value: "1", label: "<1 Nacht/Monat", score: 1 },
  { value: "2", label: "1-3 Nächte/Monat", score: 2 },
  { value: "3", label: "1-3 Nächte/Woche", score: 3 },
  { value: "4", label: "4-7 Nächte/Woche", score: 4 },
] as const;

/**
 * Waking activities scale (items 3-21)
 * General frequency
 */
export const OBC_WAKING_OPTIONS = [
  { value: "0", label: "Nie", score: 0 },
  { value: "1", label: "Selten", score: 1 },
  { value: "2", label: "Manchmal", score: 2 },
  { value: "3", label: "Häufig", score: 3 },
  { value: "4", label: "Immer", score: 4 },
] as const;

/**
 * Option labels for display
 */
export const OBC_SLEEP_OPTION_LABELS: Record<string, string> = Object.fromEntries(
  OBC_SLEEP_OPTIONS.map((opt) => [opt.value, opt.label])
);

export const OBC_WAKING_OPTION_LABELS: Record<string, string> = Object.fromEntries(
  OBC_WAKING_OPTIONS.map((opt) => [opt.value, opt.label])
);
