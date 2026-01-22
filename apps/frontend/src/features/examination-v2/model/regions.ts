/**
 * Unified source of truth for anatomical regions, palpation sites, and their labels.
 *
 * This module defines all anatomical structures and their German labels:
 * - Sides (left/right)
 * - Movement regions (E4, E5): 5 regions for pain assessment during jaw movements
 * - Palpation sites (E9): 8 specific sites for muscle examination
 * - Muscle groups for E9
 * - Pain question types
 *
 * Pattern: Objects serve as both type source AND label lookup.
 * Types are inferred from object keys (single source of truth).
 */

// === SIDES (shared across all sections) ===
export const SIDES = {
  left: "Links",
  right: "Rechts",
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
export const getMovementPainQuestions = (region: Region) =>
  region === "temporalis"
    ? (["pain", "familiarPain", "familiarHeadache"] as const)
    : (["pain", "familiarPain"] as const);

// === PALPATION SITES (E9) ===
// 8 specific palpation sites for muscle examination
export const PALPATION_SITES = {
  temporalisPosterior: "Temporalis (posterior)",
  temporalisMiddle: "Temporalis (mitte)",
  temporalisAnterior: "Temporalis (anterior)",
  masseterOrigin: "Masseter (Ursprung)",
  masseterBody: "Masseter (Körper)",
  masseterInsertion: "Masseter (Ansatz)",
  tmjLateralPole: "Kiefergelenk (lateraler Pol)",
  tmjAroundLateralPole: "Kiefergelenk (um lateralen Pol)",
} as const;
export type PalpationSite = keyof typeof PALPATION_SITES;
export const PALPATION_SITE_KEYS = Object.keys(PALPATION_SITES) as PalpationSite[];

// === MUSCLE GROUPS (E9) ===
export const MUSCLE_GROUPS = {
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "Kiefergelenk (Kiefergelenk)",
} as const;
export type MuscleGroup = keyof typeof MUSCLE_GROUPS;
export const MUSCLE_GROUP_KEYS = Object.keys(MUSCLE_GROUPS) as MuscleGroup[];

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

// Site configuration: pressure (kg), and which optional questions apply
export interface SiteConfig {
  muscleGroup: MuscleGroup;
  pressure: number;
  hasHeadache: boolean;
  hasSpreading: boolean;
}

export const SITE_CONFIG: Record<PalpationSite, SiteConfig> = {
  temporalisPosterior: {
    muscleGroup: "temporalis",
    pressure: 1.0,
    hasHeadache: true,
    hasSpreading: true,
  },
  temporalisMiddle: {
    muscleGroup: "temporalis",
    pressure: 1.0,
    hasHeadache: true,
    hasSpreading: true,
  },
  temporalisAnterior: {
    muscleGroup: "temporalis",
    pressure: 1.0,
    hasHeadache: true,
    hasSpreading: true,
  },
  masseterOrigin: {
    muscleGroup: "masseter",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: true,
  },
  masseterBody: {
    muscleGroup: "masseter",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: true,
  },
  masseterInsertion: {
    muscleGroup: "masseter",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: true,
  },
  tmjLateralPole: {
    muscleGroup: "tmj",
    pressure: 0.5,
    hasHeadache: false,
    hasSpreading: false,
  },
  tmjAroundLateralPole: {
    muscleGroup: "tmj",
    pressure: 1.0,
    hasHeadache: false,
    hasSpreading: false,
  },
};

// Pain question types for E9 palpation (in display order)
export const PALPATION_PAIN_QUESTIONS = [
  "pain",
  "familiarPain",
  "familiarHeadache",
  "spreadingPain",
  "referredPain",
] as const;
export type PalpationPainQuestion = (typeof PALPATION_PAIN_QUESTIONS)[number];

// Returns the list of pain questions applicable to a given palpation site (in correct order)
export function getPalpationPainQuestions(site: PalpationSite): PalpationPainQuestion[] {
  const config = SITE_CONFIG[site];
  const questions: PalpationPainQuestion[] = ["pain", "familiarPain"];
  if (config.hasHeadache) questions.push("familiarHeadache");
  if (config.hasSpreading) questions.push("spreadingPain");
  questions.push("referredPain");
  return questions;
}
