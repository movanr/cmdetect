/**
 * GCPS 1-Month Answer Options
 * 0-10 scale options for pain and interference questions
 */
import type { AnswerOption } from "../types";

/**
 * 0-10 pain scale options
 * Used for questions 1, 2, 3 (pain intensity)
 */
export const GCPS_1M_PAIN_SCALE_OPTIONS: AnswerOption[] = Array.from(
  { length: 11 },
  (_, i) => ({
    value: String(i),
    label: String(i),
  })
);

/**
 * 0-10 interference scale options
 * Used for questions 5, 6, 7 (interference)
 */
export const GCPS_1M_INTERFERENCE_SCALE_OPTIONS: AnswerOption[] = Array.from(
  { length: 11 },
  (_, i) => ({
    value: String(i),
    label: String(i),
  })
);

/**
 * Pain scale endpoint labels (German)
 * Used for questions 1, 2, 3
 */
export const GCPS_1M_PAIN_LABELS = {
  min: "Kein Schmerz",
  max: "Stärkster vorstellbarer Schmerz",
} as const;

/**
 * Interference scale endpoint labels (German)
 * Used for questions 6, 7, 8
 */
export const GCPS_1M_INTERFERENCE_LABELS = {
  min: "Keine Beeinträchtigung",
  max: "Unfähig, irgendeine Tätigkeit auszuüben",
} as const;

/**
 * Days input configuration for 6-month question (Question 1)
 */
export const GCPS_1M_6_MONTH_DAYS_CONFIG = {
  min: 0,
  max: 180,
  unit: "Tage",
} as const;

/**
 * Days input configuration for 30-day question (Question 5)
 */
export const GCPS_1M_DAYS_CONFIG = {
  min: 0,
  max: 30,
  unit: "Tage",
} as const;

/**
 * Option labels lookup map
 * For display in practitioner frontend
 */
export const GCPS_1M_OPTION_LABELS: Record<string, string> = Object.fromEntries(
  GCPS_1M_PAIN_SCALE_OPTIONS.map((opt) => [opt.value, opt.label])
);
