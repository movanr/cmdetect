/**
 * Unified source of truth for anatomical regions and palpation sites.
 *
 * This module defines all anatomical structures used across examination sections:
 * - Movement regions (E4, E5): 5 regions for pain assessment during jaw movements
 * - Palpation sites (E9): 8 specific sites for muscle examination
 */

// === SIDES (shared across all sections) ===
export const SIDES = ["left", "right"] as const;
export type Side = (typeof SIDES)[number];

// === MOVEMENT REGIONS (E4, E5) ===
// 5 regions for pain assessment during jaw movements
export const MOVEMENT_REGIONS = [
  "temporalis",
  "masseter",
  "tmj",
  "otherMast", // other masticatory muscles
  "nonMast", // non-masticatory structures
] as const;
export type MovementRegion = (typeof MOVEMENT_REGIONS)[number];

// Regions visible on head diagram (excludes otherMast - not anatomically renderable)
export const SVG_REGIONS: readonly MovementRegion[] = [
  "temporalis",
  "masseter",
  "tmj",
  "nonMast",
];

// Pain questions per region - temporalis gets familiarHeadache, others don't
export const getMovementPainQuestions = (region: MovementRegion) =>
  region === "temporalis"
    ? (["pain", "familiarPain", "familiarHeadache"] as const)
    : (["pain", "familiarPain"] as const);

// === PALPATION SITES (E9) ===
// 8 specific palpation sites for muscle examination
export const PALPATION_SITES = [
  "temporalisPosterior",
  "temporalisMiddle",
  "temporalisAnterior",
  "masseterOrigin",
  "masseterBody",
  "masseterInsertion",
  "tmjLateralPole",
  "tmjAroundLateralPole",
] as const;
export type PalpationSite = (typeof PALPATION_SITES)[number];

// Muscle groups for E9 (for grouping palpation sites)
export const MUSCLE_GROUPS = ["temporalis", "masseter", "tmj"] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

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

