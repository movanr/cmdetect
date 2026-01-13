/**
 * JFLS-8 Answer Options
 * 0-10 scale for jaw functional limitation
 */
import type { AnswerOption } from "../types";

/**
 * 0-10 limitation scale options
 */
export const JFLS8_SCALE_OPTIONS: AnswerOption[] = Array.from(
  { length: 11 },
  (_, i) => ({
    value: String(i),
    label: String(i),
  })
);

/**
 * Scale endpoint labels (German)
 */
export const JFLS8_SCALE_LABELS = {
  min: "Keine Einschränkung",
  max: "Starke Einschränkung",
} as const;

/**
 * Option labels lookup map
 * For display in practitioner frontend
 */
export const JFLS8_OPTION_LABELS: Record<string, string> = Object.fromEntries(
  JFLS8_SCALE_OPTIONS.map((opt) => [opt.value, opt.label])
);
