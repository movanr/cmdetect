export const SIDES = ["left", "right"] as const;
export type Side = (typeof SIDES)[number];

export const E4_REGIONS = [
  "temporalis",
  "masseter",
  "tmj",
  "otherMast",
  "nonMast",
] as const;
export type E4Region = (typeof E4_REGIONS)[number];

// Temporalis gets familiarHeadache, others don't
export const getPainQuestions = (region: E4Region) =>
  region === "temporalis"
    ? (["pain", "familiarPain", "familiarHeadache"] as const)
    : (["pain", "familiarPain"] as const);
