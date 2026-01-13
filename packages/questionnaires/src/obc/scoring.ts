/**
 * OBC (Oral Behaviors Checklist) Scoring Utilities
 *
 * Scoring methodology based on DC/TMD:
 * - Simple sum of all 21 questions (each 0-4)
 * - Max score: 84
 * - Risk levels based on TMD prevalence comparison:
 *   - 0-16: Normal behaviors
 *   - 17-24: Elevated risk (2x more common in TMD)
 *   - 25+: High risk (17x more common in TMD, contributes to onset)
 */

import type { OBCAnswers, OBCQuestionId, OBCScore, OBCRiskLevel } from "../types";
import { OBC_QUESTION_ORDER } from "./questions";

/**
 * Risk level interpretations with German labels
 */
const RISK_INTERPRETATIONS: Record<OBCRiskLevel, { label: string; labelDe: string }> = {
  normal: { label: "Normal", labelDe: "Normale Verhaltensweisen" },
  elevated: { label: "Elevated", labelDe: "Erhöhtes Risiko" },
  high: { label: "High", labelDe: "Hohes Risiko" },
};

/**
 * Get numeric value from answer string
 */
function getNumericValue(value: string | undefined): number {
  if (value === undefined || value === null) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Determine risk level from total score
 * Based on DC/TMD comparison of individuals with chronic TMD vs those without
 */
export function getOBCRiskLevel(score: number): OBCRiskLevel {
  if (score <= 16) return "normal";
  if (score <= 24) return "elevated";
  return "high";
}

/**
 * Calculate complete OBC score from answers
 */
export function calculateOBCScore(answers: OBCAnswers): OBCScore {
  // Sum all 21 questions
  let totalScore = 0;
  let answeredCount = 0;

  for (const questionId of OBC_QUESTION_ORDER) {
    const value = getNumericValue(answers[questionId as OBCQuestionId]);
    totalScore += value;
    if (answers[questionId as OBCQuestionId] !== undefined) {
      answeredCount++;
    }
  }

  const riskLevel = getOBCRiskLevel(totalScore);
  const interpretation = RISK_INTERPRETATIONS[riskLevel];

  return {
    totalScore,
    maxScore: 84, // 21 questions × 4 max points
    answeredCount,
    totalQuestions: OBC_QUESTION_ORDER.length,
    riskLevel,
    riskInterpretation: interpretation,
  };
}
