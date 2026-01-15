export const PAIN_TYPES = {
  PAIN: "pain",
  FAMILIAR: "familiarPain",
  FAMILIAR_HEADACHE: "familiarHeadache",
  REFERRED: "referred",
  SPREADING: "spreading",
} as const;

export type PainType = (typeof PAIN_TYPES)[keyof typeof PAIN_TYPES];

/**
 * Display order for pain types in grid columns.
 * Used by render components to ensure consistent column ordering.
 */
export const PAIN_TYPE_DISPLAY_ORDER: readonly PainType[] = [
  PAIN_TYPES.PAIN,
  PAIN_TYPES.FAMILIAR,
  PAIN_TYPES.FAMILIAR_HEADACHE,
  PAIN_TYPES.SPREADING,
  PAIN_TYPES.REFERRED,
];
