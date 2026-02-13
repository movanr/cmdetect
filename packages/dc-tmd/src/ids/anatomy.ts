/**
 * DC/TMD Anatomical IDs - Single source of truth for anatomical structures.
 *
 * This module defines all anatomical structures referenced in DC/TMD:
 * - Sides (left/right)
 * - Movement regions (E4, E5): 5 regions for pain assessment during jaw movements
 * - Palpation sites (E9): 8 specific sites for muscle examination
 * - Palpation regions (E9): 3 regions with palpation sites
 * - Pain question types
 *
 * Pattern: Objects serve as both type source AND label lookup.
 * Types are inferred from object keys (single source of truth).
 */

// === SIDES (shared across all sections) ===
export const SIDES = {
  left: "Linke Seite",
  right: "Rechte Seite",
} as const;
export type Side = keyof typeof SIDES;
export const SIDE_KEYS = Object.keys(SIDES) as Side[];

// === MOVEMENT REGIONS (E4, E5) ===
// 5 regions for pain assessment during jaw movements
export const REGIONS = {
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "Kiefergelenk",
  otherMast: "Andere Kaumusk.", // other masticatory muscles
  nonMast: "Nicht-Kaumusk.", // non-masticatory structures
} as const;
export type Region = keyof typeof REGIONS;
export const REGION_KEYS = Object.keys(REGIONS) as Region[];

// Regions visible on head diagram (excludes otherMast - not anatomically renderable)
export const SVG_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj", "nonMast"];

// Base regions - the 3 primary regions (temporalis, masseter, tmj)
export const BASE_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];

// All regions for interview (all 5 regions)
export const ALL_REGIONS: readonly Region[] = REGION_KEYS;

// Pain questions per region - temporalis gets familiarHeadache, others don't
// Uses satisfies to ensure all values are valid PainTypes
export const getMovementPainQuestions = (region: Region) =>
  region === "temporalis"
    ? (["pain", "familiarPain", "familiarHeadache"] as const satisfies readonly PainType[])
    : (["pain", "familiarPain"] as const satisfies readonly PainType[]);

// === PALPATION SITES (E9 + E10) ===
// 8 E9 sites for muscle/TMJ examination + 4 E10 supplemental sites
export const PALPATION_SITES = {
  // E9 sites
  temporalisPosterior: "Temporalis (posterior)",
  temporalisMiddle: "Temporalis (media)",
  temporalisAnterior: "Temporalis (anterior)",
  masseterOrigin: "Masseter (Ursprung)",
  masseterBody: "Masseter (Körper)",
  masseterInsertion: "Masseter (Ansatz)",
  tmjLateralPole: "Kiefergelenk (lateraler Pol)",
  tmjAroundLateralPole: "Kiefergelenk (um den lateralen Pol)",
  // E10 supplemental sites
  posteriorMandibular: "Regio retromandibularis",
  submandibular: "Regio submandibularis",
  lateralPterygoid: "Bereich des M. pteryg. lat.",
  temporalisTendon: "Temporalissehne",
} as const;
export type PalpationSite = keyof typeof PALPATION_SITES;
export const PALPATION_SITE_KEYS = Object.keys(PALPATION_SITES) as PalpationSite[];

// === PALPATION REGIONS (E9) ===
// The 3 regions that have E9 palpation sites: temporalis, masseter, tmj
export const PALPATION_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];

// === E10 SUPPLEMENTAL PALPATION ===
// The 2 regions that have E10 supplemental palpation sites
export const E10_PALPATION_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

// E10 palpation site keys (subset of PALPATION_SITE_KEYS)
export const E10_SITE_KEYS: readonly PalpationSite[] = [
  "posteriorMandibular",
  "submandibular",
  "lateralPterygoid",
  "temporalisTendon",
];

// E10 pain questions (no headache, no spreading — only pain, familiarPain, referredPain)
export const E10_PAIN_QUESTIONS = [
  "pain",
  "familiarPain",
  "referredPain",
] as const satisfies readonly PainType[];

// === PAIN QUESTION TYPES ===
export const PAIN_TYPES = {
  pain: "Schmerz",
  familiarPain: "Bekannter Schmerz",
  familiarHeadache: "Bekannter Kopfschmerz",
  referredPain: "Übertragener Schmerz",
  spreadingPain: "Ausbreitender Schmerz",
} as const;
export type PainType = keyof typeof PAIN_TYPES;
export const PAIN_TYPE_KEYS = Object.keys(PAIN_TYPES) as PainType[];

// Site configuration: pressure (kg), which optional questions apply, and which section owns the site
export interface SiteConfig {
  region: Region;
  pressure: number;
  hasHeadache: boolean;
  hasSpreading: boolean;
  /** Which examination section this site belongs to (used for field ref prefixes) */
  section: "e9" | "e10";
}

export const SITE_CONFIG: Record<PalpationSite, SiteConfig> = {
  // E9 sites
  temporalisPosterior: {
    region: "temporalis",
    pressure: 1.0,
    hasHeadache: true,
    hasSpreading: true,
    section: "e9",
  },
  temporalisMiddle: {
    region: "temporalis",
    pressure: 1.0,
    hasHeadache: true,
    hasSpreading: true,
    section: "e9",
  },
  temporalisAnterior: {
    region: "temporalis",
    pressure: 1.0,
    hasHeadache: true,
    hasSpreading: true,
    section: "e9",
  },
  masseterOrigin: {
    region: "masseter",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: true,
    section: "e9",
  },
  masseterBody: {
    region: "masseter",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: true,
    section: "e9",
  },
  masseterInsertion: {
    region: "masseter",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: true,
    section: "e9",
  },
  tmjLateralPole: {
    region: "tmj",
    pressure: 0.5,
    hasHeadache: false,
    hasSpreading: false,
    section: "e9",
  },
  tmjAroundLateralPole: {
    region: "tmj",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: false,
    section: "e9",
  },
  // E10 supplemental sites
  posteriorMandibular: {
    region: "nonMast",
    pressure: 0.5,
    hasHeadache: false,
    hasSpreading: false,
    section: "e10",
  },
  submandibular: {
    region: "nonMast",
    pressure: 0.5,
    hasHeadache: false,
    hasSpreading: false,
    section: "e10",
  },
  lateralPterygoid: {
    region: "otherMast",
    pressure: 0.5,
    hasHeadache: false,
    hasSpreading: false,
    section: "e10",
  },
  temporalisTendon: {
    region: "otherMast",
    pressure: 0.5,
    hasHeadache: false,
    hasSpreading: false,
    section: "e10",
  },
};

// Pain question types for E9 palpation (in display order)
// Uses satisfies to ensure all values are valid PainTypes while preserving tuple type
export const PALPATION_PAIN_QUESTIONS = [
  "pain",
  "familiarPain",
  "familiarHeadache",
  "spreadingPain",
  "referredPain",
] as const satisfies readonly PainType[];

// Type is derived from PainType, removing conceptual duplication
export type PalpationPainQuestion = (typeof PALPATION_PAIN_QUESTIONS)[number];

// === PALPATION MODES (E9) ===
// Per DC/TMD protocol: basic (2 sec) for screening, standard (5 sec) for full diagnosis.
// The 5-second stimulus elicits both referred and spreading pain from the same patient
// response ("nur unter meinem Finger?"), so there is no separate "extended" mode.
export const PALPATION_MODES = {
  basic: "Basis (2 Sek.)",
  standard: "Standard (5 Sek.)",
} as const;
export type PalpationMode = keyof typeof PALPATION_MODES;
export const PALPATION_MODE_KEYS = Object.keys(PALPATION_MODES) as PalpationMode[];

// Questions shown per palpation mode (cumulative depth)
export const PALPATION_MODE_QUESTIONS: Record<PalpationMode, readonly PalpationPainQuestion[]> = {
  basic: ["pain", "familiarPain", "familiarHeadache"],
  standard: ["pain", "familiarPain", "familiarHeadache", "referredPain", "spreadingPain"],
};

// === SITE DETAIL MODES (E9) ===
// Toggle between detailed (8 individual sites) and grouped (3 muscle groups) views
export const SITE_DETAIL_MODES = {
  detailed: "Detailliert",
  grouped: "Gruppiert",
} as const;
export type SiteDetailMode = keyof typeof SITE_DETAIL_MODES;
export const SITE_DETAIL_MODE_KEYS = Object.keys(SITE_DETAIL_MODES) as SiteDetailMode[];

// Map muscle groups to their constituent palpation sites
export const SITES_BY_GROUP: Record<Region, readonly PalpationSite[]> = {
  temporalis: ["temporalisPosterior", "temporalisMiddle", "temporalisAnterior"],
  masseter: ["masseterOrigin", "masseterBody", "masseterInsertion"],
  tmj: ["tmjLateralPole", "tmjAroundLateralPole"],
  otherMast: ["lateralPterygoid", "temporalisTendon"],
  nonMast: ["posteriorMandibular", "submandibular"],
};

// Group-level question applicability (derived from site configs)
export const GROUP_CONFIG: Record<Region, { hasHeadache: boolean; hasSpreading: boolean }> = {
  temporalis: { hasHeadache: true, hasSpreading: true },
  masseter: { hasHeadache: false, hasSpreading: true },
  tmj: { hasHeadache: false, hasSpreading: false },
  otherMast: {
    hasHeadache: false,
    hasSpreading: false,
  },
  nonMast: {
    hasHeadache: false,
    hasSpreading: false,
  },
};

// Returns the list of pain questions applicable to a given palpation site (in correct order)
export function getPalpationPainQuestions(site: PalpationSite): PalpationPainQuestion[] {
  const config = SITE_CONFIG[site];
  const questions: PalpationPainQuestion[] = ["pain", "familiarPain"];
  if (config.hasHeadache) questions.push("familiarHeadache");
  if (config.hasSpreading) questions.push("spreadingPain");
  questions.push("referredPain");
  return questions;
}
