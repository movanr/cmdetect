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

/* ---------------- earlier version ----------- /*
/*export const REGION_CATEGORIES = [
  "muscle",
  "masticatory",
  "joint",
  "inner",
  "non-masticatory",
] as const;

export type RegionCategory = (typeof REGION_CATEGORIES)[number];

type RegionType = {
  semanticId: string;
  category: RegionCategory[];
};

export const REGIONS = {
  temporalis: {
    semanticId: "temporalis",
    category: ["masticatory", "muscle"],
  },

  masseter: {
    id: "masseter",
    label: {
      en: "Masseter",
      de: "Masseter",
    },
    category: ["masticatory", "muscle"],
  },

  tmj: {
    id: "tmj",
    label: {
      en: "TMJ",
      de: "Kiefergelenk",
    },
    category: ["masticatory", "joint"],
  },
  otherMast: {
    id: "otherMast",
    label: {
      en: "Other M Musc",
      de: "Andere Kaumuskeln",
    },
    category: ["masticatory", "inner"],
  },
  nonMast: {
    id: "nonMast",
    label: {
      en: "Non-mast",
      de: "Nicht-Kaumuskeln",
    },
    category: ["non-masticatory"],
  },
} as const satisfies Record<string, RegionType>;

export type RegionId = keyof typeof REGIONS;

export type Region = (typeof REGIONS)[RegionId];
*/
