export const PAIN_TYPES = {
  PAIN: "pain",
  FAMILIAR: "familiarPain",
  FAMILIAR_HEADACHE: "familiarHeadache",
  REFERRED: "referred",
  SPREADING: "spreading",
} as const;

export type PainType = (typeof PAIN_TYPES)[keyof typeof PAIN_TYPES];
