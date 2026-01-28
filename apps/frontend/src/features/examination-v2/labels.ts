/**
 * UI labels not tied to anatomical regions.
 *
 * For anatomical labels (regions, sides, palpation sites, muscle groups, pain types),
 * import directly from ./model/regions.ts where they are co-located with their types.
 */

import {
  PAIN_TYPES,
  PALPATION_SITES,
  REGIONS,
  SECTIONS,
  SIDES,
  type PainType,
  type PalpationSite,
  type Region,
  type SectionId,
  type Side,
} from "./model/regions";

// === SECTION LABELS ===
export const SECTION_LABELS: Partial<Record<SectionId, { title: string; cardTitle: string }>> = {
  [SECTIONS.e1]: { title: "U1: Schmerzlokalisation", cardTitle: "U1 - Schmerzlokalisation" },
  [SECTIONS.e2]: {
    title: "U2: Schneidekantenverhältnisse",
    cardTitle: "U2 - Schneidekantenverhältnisse",
  },
  [SECTIONS.e3]: { title: "U3: Öffnungsmuster", cardTitle: "U3 - Öffnungs- und Schließmuster" },
  [SECTIONS.e4]: { title: "U4: Mundöffnung", cardTitle: "U4 - Öffnungs- und Schließbewegungen" },
  [SECTIONS.e9]: { title: "U9: Palpation", cardTitle: "U9 - Palpation Muskeln & Kiefergelenk" },
};

// === STEP LABELS ===
export type StepId =
  | "e1-all"
  | "e2-all"
  | "e3-all"
  | "e4a"
  | "e4b-measure"
  | "e4b-interview"
  | "e4c-measure"
  | "e4c-interview"
  | "e9-left"
  | "e9-right";

export const STEP_LABELS: Record<StepId, { badge: string; title: string }> = {
  "e1-all": { badge: "U1", title: "Schmerzlokalisation" },
  "e2-all": { badge: "U2", title: "Schneidekantenverhältnisse" },
  "e3-all": { badge: "U3", title: "Öffnungsmuster" },
  e4a: { badge: "U4A", title: "Schmerzfreie Mundöffnung" },
  "e4b-measure": { badge: "U4B", title: "Maximale aktive Mundöffnung" },
  "e4b-interview": { badge: "U4B", title: "Schmerzbefragung" },
  "e4c-measure": { badge: "U4C", title: "Maximale passive Mundöffnung" },
  "e4c-interview": { badge: "U4C", title: "Schmerzbefragung" },
  "e9-left": { badge: "U9", title: "Palpation Links" },
  "e9-right": { badge: "U9", title: "Palpation Rechts" },
};

// === COMMON UI LABELS ===
export const COMMON = {
  yes: "Ja",
  no: "Nein",
  pain: "Schmerz",
  noPain: "Kein Schmerz",
  noMorePainRegions: "Keine weiteren Schmerzregionen",
  terminated: "Abgebrochen",
  measurement: "Messung",
  painFreeOpening: "Schmerzfreie Öffnung",
  maxUnassistedOpening: "Maximale Öffnung (unassistiert)",
  maxAssistedOpening: "Maximale Öffnung (assistiert)",
} as const;

// === LABEL LOOKUP FUNCTIONS ===
// These provide type-safe label lookups using the constants from regions.ts

/** Get label for a side */
export const getSideLabel = (side: Side): string => SIDES[side];

/** Get label for a region */
export const getRegionLabel = (region: Region): string => REGIONS[region];

/** Get label for a pain type */
export const getPainTypeLabel = (painType: PainType): string => PAIN_TYPES[painType];

/** Get label for a palpation site */
export const getPalpationSiteLabel = (site: PalpationSite): string => PALPATION_SITES[site];

/**
 * Generic label lookup for labelKey strings (used by QuestionInstance).
 * Falls back to key if not found in COMMON.
 */
export const getLabel = (key?: string): string | undefined => {
  if (!key) return undefined;
  return (COMMON as Record<string, string>)[key] ?? key;
};
