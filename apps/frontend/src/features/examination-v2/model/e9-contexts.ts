// E9 palpation sites and configuration

export const E9_PALPATION_SITES = [
  "temporalisPosterior",
  "temporalisMiddle",
  "temporalisAnterior",
  "masseterOrigin",
  "masseterBody",
  "masseterInsertion",
  "tmjLateralPole",
  "tmjAroundLateralPole",
] as const;
export type E9PalpationSite = (typeof E9_PALPATION_SITES)[number];

export const E9_MUSCLE_GROUPS = ["temporalis", "masseter", "tmj"] as const;
export type E9MuscleGroup = (typeof E9_MUSCLE_GROUPS)[number];

// Site metadata: pressure (kg), and which optional questions apply
export const E9_SITE_CONFIG: Record<
  E9PalpationSite,
  {
    muscleGroup: E9MuscleGroup;
    pressure: number;
    hasHeadache: boolean;
    hasSpreading: boolean;
  }
> = {
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

// Pain question types for E9 (in display order)
export const E9_PAIN_QUESTIONS = [
  "pain",
  "familiarPain",
  "familiarHeadache",
  "spreadingPain",
  "referredPain",
] as const;
export type E9PainQuestion = (typeof E9_PAIN_QUESTIONS)[number];

// Returns the list of pain questions applicable to a given palpation site (in correct order)
export function getE9PalpationQuestions(site: E9PalpationSite): E9PainQuestion[] {
  const config = E9_SITE_CONFIG[site];
  const questions: E9PainQuestion[] = ["pain", "familiarPain"];
  if (config.hasHeadache) questions.push("familiarHeadache");
  if (config.hasSpreading) questions.push("spreadingPain");
  questions.push("referredPain");
  return questions;
}
