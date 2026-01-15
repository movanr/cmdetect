/**
 * Labels for yes/no answer options.
 */
export const YES_NO_LABELS = {
  yes: "Ja",
  no: "Nein",
} as const;

/**
 * Answer option values matching the model's ANSWER_VALUES.
 */
export const ANSWER_OPTION_LABELS = {
  yes: YES_NO_LABELS.yes,
  no: YES_NO_LABELS.no,
} as const;
