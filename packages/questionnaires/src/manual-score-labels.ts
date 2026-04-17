/**
 * German display labels for the enum-valued fields that practitioners enter
 * on the anamnesis manual-score panels. Shared between the scoring UI (for
 * Select options) and the print view (for interpreting stored values).
 *
 * JFLS-8 and JFLS-20 "classification" is free text, so there is no enum map
 * for those; the stored string is rendered as-is.
 */

export interface LabelOption {
  readonly value: string;
  readonly label: string;
}

function toOptions<T extends Record<string, string>>(map: T): ReadonlyArray<LabelOption> {
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}

export const PHQ4_SEVERITY_LABELS = {
  normal: "Normal",
  leicht: "Leicht",
  moderat: "Moderat",
  schwer: "Schwer",
} as const;
export const PHQ4_SEVERITY_OPTIONS: ReadonlyArray<LabelOption> = toOptions(PHQ4_SEVERITY_LABELS);

export const OBC_SEVERITY_LABELS = {
  keine: "Keine",
  niedrig: "Niedrig",
  hoch: "Hoch",
} as const;
export const OBC_SEVERITY_OPTIONS: ReadonlyArray<LabelOption> = toOptions(OBC_SEVERITY_LABELS);

export const GCPS_GRADE_LABELS = {
  grad_0: "Grad 0",
  grad_1: "Grad I",
  grad_2: "Grad II",
  grad_3: "Grad III",
  grad_4: "Grad IV",
} as const;
export const GCPS_GRADE_OPTIONS: ReadonlyArray<LabelOption> = toOptions(GCPS_GRADE_LABELS);

export const PAIN_DRAWING_SEVERITY_LABELS = {
  keine: "Keine",
  leicht: "Leicht",
  moderat: "Moderat",
  schwer: "Schwer",
} as const;
export const PAIN_DRAWING_SEVERITY_OPTIONS: ReadonlyArray<LabelOption> = toOptions(
  PAIN_DRAWING_SEVERITY_LABELS
);

/** Resolve a stored enum value to its display label; returns the raw value if unknown. */
export function resolveLabel(map: Record<string, string>, value: string | undefined): string {
  if (!value) return "";
  return map[value] ?? value;
}
