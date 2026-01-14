export const REGIONS = {
  TEMPORALIS: "temporalis",
  MASSETER: "masseter",
  TMJ: "tmj",
  OTHER_MAST: "otherMast",
  NON_MAST: "nonMast",
  TEMPORALIS_POST: "temporalisPost",
  TEMPORALIS_MEDIA: "temporalisMedia",
  TEMPORALIS_ANT: "temporalisAnt",
  MASSETER_ORIGIN: "masseterOrigin",
  MASSETER_BODY: "masseterBody",
  MASSETER_INSERTION: "masseterInsertion",
} as const;

export type Region = (typeof REGIONS)[keyof typeof REGIONS];
