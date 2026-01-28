/**
 * UI labels not tied to anatomical regions.
 *
 * For anatomical labels (regions, sides, palpation sites, muscle groups, pain types),
 * import directly from ./model/regions.ts where they are co-located with their types.
 *
 * Section labels are now defined in @cmdetect/dc-tmd and re-exported here.
 */

import {
  getSectionBadge,
  getSectionCardTitle,
  getSectionTitle,
  PAIN_TYPES,
  PALPATION_SITES,
  REGIONS,
  SECTION_LABELS,
  SECTIONS,
  SIDES,
  type PainType,
  type PalpationSite,
  type Region,
  type Side,
} from "./model/regions";

// Re-export section label utilities from dc-tmd
export { getSectionBadge, getSectionCardTitle, getSectionTitle, SECTION_LABELS };

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
  "e1-all": { badge: getSectionBadge(SECTIONS.e1), title: SECTION_LABELS.e1.short },
  "e2-all": { badge: getSectionBadge(SECTIONS.e2), title: SECTION_LABELS.e2.short },
  "e3-all": { badge: getSectionBadge(SECTIONS.e3), title: SECTION_LABELS.e3.short },
  e4a: { badge: "U4A", title: "Schmerzfreie Mundöffnung" },
  "e4b-measure": { badge: "U4B", title: "Maximale aktive Mundöffnung" },
  "e4b-interview": { badge: "U4B", title: "Schmerzbefragung" },
  "e4c-measure": { badge: "U4C", title: "Maximale passive Mundöffnung" },
  "e4c-interview": { badge: "U4C", title: "Schmerzbefragung" },
  "e9-left": { badge: getSectionBadge(SECTIONS.e9), title: "Palpation Links" },
  "e9-right": { badge: getSectionBadge(SECTIONS.e9), title: "Palpation Rechts" },
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
