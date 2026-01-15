export const MEASUREMENT_IDS = {
  PAIN_FREE_OPENING: "painFreeOpening",
  TERMINATED: "terminated",
} as const;

export type MeasurementId = (typeof MEASUREMENT_IDS)[keyof typeof MEASUREMENT_IDS];
