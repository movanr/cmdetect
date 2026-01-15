export const REGIONS = {
  // General regions (for E4 movements)
  TEMPORALIS: "temporalis",
  MASSETER: "masseter",
  TMJ: "tmj",
  OTHER_MAST: "otherMast",
  NON_MAST: "nonMast",
  // Temporalis zones (for E9 palpation)
  TEMPORALIS_POST: "temporalisPost",
  TEMPORALIS_MEDIA: "temporalisMedia",
  TEMPORALIS_ANT: "temporalisAnt",
  // Masseter zones (for E9 palpation)
  MASSETER_ORIGIN: "masseterOrigin",
  MASSETER_BODY: "masseterBody",
  MASSETER_INSERTION: "masseterInsertion",
  // TMJ zones (for E9 palpation)
  TMJ_LATERAL_POLE: "tmjLateralPole",
  TMJ_AROUND_LATERAL_POLE: "tmjAroundLateralPole",
} as const;

export type Region = (typeof REGIONS)[keyof typeof REGIONS];
