/**
 * JFLS-20 (Jaw Functional Limitation Scale - 20 items) Scoring Utilities
 *
 * Scoring methodology:
 * - Global score = mean of all available items (0-10 scale)
 * - Max 2 items may be missing for valid global score
 * - Subscale scores computed for each type of functional limitation
 *
 * Subscales:
 * - Mastication: items 1-6 (max 2 missing)
 * - Mobility: items 7-10 (max 1 missing)
 * - Communication: items 13-20 (max 2 missing)
 * Note: Items 11 (Schlucken) and 12 (Gähnen) are NOT in any subscale
 *
 * Reference values:
 * Scale            | No TMD Mean (SE) | Chronic TMD Mean (SE)
 * Mastication      | 0.28 (0.02)      | 2.22 (0.13)
 * Mobility         | 0.18 (0.02)      | 2.22 (0.13)
 * Communication    | 0.14 (0.02)      | 0.72 (0.10)
 * Global           | 0.16 (0.02)      | 1.74 (0.11)
 */

import type {
  JFLS20Answers,
  JFLS20QuestionId,
  JFLS20Score,
  JFLS20SubscaleScore,
  JFLS20LimitationLevel,
  JFLS20SubscaleId,
} from "../types";
import { JFLS20_QUESTION_ORDER } from "./questions";

/**
 * Subscale item mappings
 */
const MASTICATION_ITEMS: JFLS20QuestionId[] = [
  "JFLS20_1",
  "JFLS20_2",
  "JFLS20_3",
  "JFLS20_4",
  "JFLS20_5",
  "JFLS20_6",
];

const MOBILITY_ITEMS: JFLS20QuestionId[] = [
  "JFLS20_7",
  "JFLS20_8",
  "JFLS20_9",
  "JFLS20_10",
];

const COMMUNICATION_ITEMS: JFLS20QuestionId[] = [
  "JFLS20_13",
  "JFLS20_14",
  "JFLS20_15",
  "JFLS20_16",
  "JFLS20_17",
  "JFLS20_18",
  "JFLS20_19",
  "JFLS20_20",
];

/**
 * Maximum missing items allowed per scale
 */
const MAX_MISSING = {
  global: 2,
  mastication: 2,
  mobility: 1,
  communication: 2,
} as const;

/**
 * Reference values for interpretation
 */
export const JFLS20_REFERENCE_VALUES = {
  global: {
    healthy: { mean: 0.16, se: 0.02 },
    chronicTMD: { mean: 1.74, se: 0.11 },
  },
  mastication: {
    healthy: { mean: 0.28, se: 0.02 },
    chronicTMD: { mean: 2.22, se: 0.13 },
  },
  mobility: {
    healthy: { mean: 0.18, se: 0.02 },
    chronicTMD: { mean: 2.22, se: 0.13 },
  },
  communication: {
    healthy: { mean: 0.14, se: 0.02 },
    chronicTMD: { mean: 0.72, se: 0.10 },
  },
} as const;

/**
 * Limitation level interpretations with German labels
 */
const LIMITATION_INTERPRETATIONS: Record<
  JFLS20LimitationLevel,
  { label: string; labelDe: string }
> = {
  normal: { label: "Normal", labelDe: "Normale Funktion" },
  mild: { label: "Mild", labelDe: "Leichte Einschränkung" },
  significant: { label: "Significant", labelDe: "Deutliche Einschränkung" },
};

/**
 * Get numeric value from answer string
 */
function getNumericValue(value: string | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Determine limitation level from score
 * Uses different thresholds for different subscales based on reference values
 */
export function getJFLS20LimitationLevel(
  score: number,
  subscale: JFLS20SubscaleId | "global" = "global"
): JFLS20LimitationLevel {
  const ref = JFLS20_REFERENCE_VALUES[subscale];

  // Normal: below midpoint between healthy and TMD
  // Mild: between midpoint and chronic TMD mean
  // Significant: at or above chronic TMD mean
  const midpoint = (ref.healthy.mean + ref.chronicTMD.mean) / 2;

  if (score < midpoint) return "normal";
  if (score < ref.chronicTMD.mean) return "mild";
  return "significant";
}

/**
 * Calculate score for a subscale
 */
function calculateSubscaleScore(
  answers: JFLS20Answers,
  items: JFLS20QuestionId[],
  maxMissing: number,
  subscaleId: JFLS20SubscaleId
): JFLS20SubscaleScore {
  const values: number[] = [];
  let missingCount = 0;

  for (const questionId of items) {
    const value = getNumericValue(answers[questionId]);
    if (value !== null) {
      values.push(value);
    } else {
      missingCount++;
    }
  }

  const answeredCount = values.length;
  const totalQuestions = items.length;
  const isValid = missingCount <= maxMissing;

  let score: number | null = null;
  let limitationLevel: JFLS20LimitationLevel | null = null;
  let limitationInterpretation: { label: string; labelDe: string } | null = null;

  if (isValid && answeredCount > 0) {
    const sum = values.reduce((acc, val) => acc + val, 0);
    score = Math.round((sum / answeredCount) * 100) / 100;
    limitationLevel = getJFLS20LimitationLevel(score, subscaleId);
    limitationInterpretation = LIMITATION_INTERPRETATIONS[limitationLevel];
  }

  return {
    score,
    answeredCount,
    totalQuestions,
    missingCount,
    isValid,
    limitationLevel,
    limitationInterpretation,
  };
}

/**
 * Calculate JFLS-20 global score and subscales from answers
 */
export function calculateJFLS20Score(answers: JFLS20Answers): JFLS20Score {
  // Calculate subscales first
  const mastication = calculateSubscaleScore(
    answers,
    MASTICATION_ITEMS,
    MAX_MISSING.mastication,
    "mastication"
  );
  const mobility = calculateSubscaleScore(
    answers,
    MOBILITY_ITEMS,
    MAX_MISSING.mobility,
    "mobility"
  );
  const communication = calculateSubscaleScore(
    answers,
    COMMUNICATION_ITEMS,
    MAX_MISSING.communication,
    "communication"
  );

  // Calculate global score (mean of all items)
  const allValues: number[] = [];
  let globalMissingCount = 0;

  for (const questionId of JFLS20_QUESTION_ORDER) {
    const value = getNumericValue(answers[questionId as JFLS20QuestionId]);
    if (value !== null) {
      allValues.push(value);
    } else {
      globalMissingCount++;
    }
  }

  const answeredCount = allValues.length;
  const totalQuestions = JFLS20_QUESTION_ORDER.length;
  const isValid = globalMissingCount <= MAX_MISSING.global;

  // Calculate global score
  let globalScore: number | null = null;
  let limitationLevel: JFLS20LimitationLevel | null = null;
  let limitationInterpretation: { label: string; labelDe: string } | null = null;

  if (isValid && answeredCount > 0) {
    const sum = allValues.reduce((acc, val) => acc + val, 0);
    globalScore = Math.round((sum / answeredCount) * 100) / 100;
    limitationLevel = getJFLS20LimitationLevel(globalScore, "global");
    limitationInterpretation = LIMITATION_INTERPRETATIONS[limitationLevel];
  }

  // Calculate alternative global score (mean of subscales)
  // All 3 subscales must be valid
  let subscaleGlobalScore: number | null = null;
  if (
    mastication.isValid &&
    mastication.score !== null &&
    mobility.isValid &&
    mobility.score !== null &&
    communication.isValid &&
    communication.score !== null
  ) {
    subscaleGlobalScore =
      Math.round(
        ((mastication.score + mobility.score + communication.score) / 3) * 100
      ) / 100;
  }

  return {
    globalScore,
    subscaleGlobalScore,
    maxScore: 10,
    answeredCount,
    totalQuestions,
    missingCount: globalMissingCount,
    isValid,
    limitationLevel,
    limitationInterpretation,
    subscales: {
      mastication,
      mobility,
      communication,
    },
  };
}

/**
 * Get subscale items for a given subscale ID
 */
export function getJFLS20SubscaleItems(
  subscaleId: JFLS20SubscaleId
): JFLS20QuestionId[] {
  switch (subscaleId) {
    case "mastication":
      return MASTICATION_ITEMS;
    case "mobility":
      return MOBILITY_ITEMS;
    case "communication":
      return COMMUNICATION_ITEMS;
  }
}

/**
 * Subscale labels for display
 */
export const JFLS20_SUBSCALE_LABELS: Record<
  JFLS20SubscaleId,
  { label: string; labelDe: string }
> = {
  mastication: { label: "Mastication", labelDe: "Kauen" },
  mobility: { label: "Mobility", labelDe: "Mobilität" },
  communication: { label: "Communication", labelDe: "Kommunikation" },
};
