/**
 * PHQ-4 Scoring Utilities
 *
 * PHQ-4 = GAD-2 (anxiety) + PHQ-2 (depression)
 * - GAD-2: PHQ4_C + PHQ4_D (items 3 & 4)
 * - PHQ-2: PHQ4_A + PHQ4_B (items 1 & 2)
 *
 * Total score range: 0-12
 * Each subscale: 0-6
 */
import type {
  PHQ4Answers,
  PHQ4Score,
  PHQ4Interpretation,
  PHQ4SubscaleResult,
} from "../types";

/**
 * Calculate PHQ-4 scores from answers
 */
export function calculatePHQ4Score(answers: PHQ4Answers): PHQ4Score {
  const getScore = (id: keyof PHQ4Answers): number => {
    const value = answers[id];
    if (value === undefined || value === null) return 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // PHQ-2 (depression): items A and B
  const depression = getScore("PHQ4_A") + getScore("PHQ4_B");

  // GAD-2 (anxiety): items C and D
  const anxiety = getScore("PHQ4_C") + getScore("PHQ4_D");

  // Total
  const total = depression + anxiety;

  return {
    total,
    maxTotal: 12,
    anxiety,
    maxAnxiety: 6,
    depression,
    maxDepression: 6,
  };
}

/**
 * Get interpretation text for PHQ-4 total score
 */
export function getPHQ4Interpretation(score: PHQ4Score): PHQ4Interpretation {
  if (score.total <= 2) {
    return { severity: "none", text: "Keine bis minimale psychische Belastung" };
  } else if (score.total <= 5) {
    return { severity: "mild", text: "Leichte psychische Belastung" };
  } else if (score.total <= 8) {
    return { severity: "moderate", text: "Mäßige psychische Belastung" };
  } else {
    return { severity: "severe", text: "Schwere psychische Belastung" };
  }
}

/**
 * Get subscale interpretation
 * Score >= 3 is considered positive screening
 */
export function getSubscaleInterpretation(score: number): PHQ4SubscaleResult {
  if (score >= 3) {
    return { positive: true, text: "Auffällig (≥3)" };
  }
  return { positive: false, text: "Unauffällig (<3)" };
}
