/**
 * SQ Answer Options (German)
 */
import type { AnswerOption } from "../types";

/**
 * Yes/No options for most SQ questions
 */
export const SQ_YES_NO_OPTIONS: AnswerOption[] = [
  { value: "no", label: "Nein" },
  { value: "yes", label: "Ja" },
];

/**
 * Matrix row options (same as Yes/No)
 */
export const SQ_MATRIX_OPTIONS: AnswerOption[] = [
  { value: "no", label: "Nein" },
  { value: "yes", label: "Ja" },
];

/**
 * SQ3 pain frequency options
 */
export const SQ_PAIN_FREQUENCY_OPTIONS: AnswerOption[] = [
  { value: "no_pain", label: "Keine Schmerzen" },
  { value: "intermittent", label: "Schmerzen kommen und gehen" },
  { value: "continuous", label: "Schmerzen sind immer vorhanden" },
];

/**
 * Yes/No label lookup
 */
export const SQ_YES_NO_LABELS: Record<string, string> = {
  yes: "Ja",
  no: "Nein",
};

/**
 * SQ3 pain frequency label lookup
 */
export const SQ_PAIN_FREQUENCY_LABELS: Record<string, string> = {
  no_pain: "Keine Schmerzen",
  intermittent: "Schmerzen kommen und gehen",
  continuous: "Schmerzen sind immer vorhanden",
};

/**
 * Duration field labels (German)
 */
export const SQ_DURATION_LABELS = {
  years: "Jahre",
  months: "Monate",
} as const;
