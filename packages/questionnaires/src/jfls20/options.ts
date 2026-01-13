/**
 * JFLS-20 Answer Options
 * 0-10 scale for jaw functional limitation (identical to JFLS-8)
 */
import type { AnswerOption } from "../types";

/**
 * 0-10 limitation scale options
 */
export const JFLS20_SCALE_OPTIONS: AnswerOption[] = Array.from(
  { length: 11 },
  (_, i) => ({
    value: String(i),
    label: String(i),
  })
);

/**
 * Scale endpoint labels (German)
 */
export const JFLS20_SCALE_LABELS = {
  min: "Keine Einschränkung",
  max: "Starke Einschränkung",
} as const;

/**
 * Option labels lookup map
 */
export const JFLS20_OPTION_LABELS: Record<string, string> = Object.fromEntries(
  JFLS20_SCALE_OPTIONS.map((opt) => [opt.value, opt.label])
);
