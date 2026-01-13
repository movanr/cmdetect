/**
 * GCPS-1M (Graded Chronic Pain Scale - 1 Month) Scoring Utilities
 *
 * Scoring methodology from DC/TMD v2.0:
 * - CPI (Characteristic Pain Intensity): mean of items 2-4 × 10
 * - Interference Score: mean of items 6-8 × 10
 * - Disability Points: from interference score + disability days
 * - Grade 0-IV: based on CPI and total disability points
 */

import type {
  GCPS1MAnswers,
  GCPS1MScore,
  GCPSGrade,
  GCPSGradeInterpretation,
  GCPSCPILevel,
} from "../types";

/**
 * Grade interpretations with German labels (per DC/TMD German manual)
 *
 * Funktionaler chronischer Schmerz (Grade I-II): < 3 BP
 * Dysfunktionaler chronischer Schmerz (Grade III-IV): ≥ 3 BP
 */
const GRADE_INTERPRETATIONS: Record<GCPSGrade, GCPSGradeInterpretation> = {
  0: { grade: 0, label: "None", labelDe: "Kein Schmerz" },
  1: { grade: 1, label: "Low Intensity", labelDe: "Geringe Schmerzintensität" },
  2: { grade: 2, label: "High Intensity", labelDe: "Hohe Schmerzintensität" },
  3: { grade: 3, label: "Moderately Limiting", labelDe: "Mäßige Einschränkung" },
  4: { grade: 4, label: "Severely Limiting", labelDe: "Hochgradige Einschränkung" },
};

/**
 * Get numeric value from answer (handles both string and number)
 */
function getNumericValue(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate CPI (Characteristic Pain Intensity)
 * Mean of items 2-4 (current, worst, average pain) × 10
 * Range: 0-100
 */
export function calculateCPI(answers: GCPS1MAnswers): number {
  const item2 = getNumericValue(answers.GCPS1M_2); // Current pain
  const item3 = getNumericValue(answers.GCPS1M_3); // Worst pain
  const item4 = getNumericValue(answers.GCPS1M_4); // Average pain

  const mean = (item2 + item3 + item4) / 3;
  return Math.round(mean * 10);
}

/**
 * Get CPI level interpretation
 */
export function getCPILevel(cpi: number): GCPSCPILevel {
  if (cpi === 0) return "none";
  if (cpi < 50) return "low";
  return "high";
}

/**
 * Calculate Interference Score
 * Mean of items 6-8 (daily, social, work interference) × 10
 * Range: 0-100
 */
export function calculateInterferenceScore(answers: GCPS1MAnswers): number {
  const item6 = getNumericValue(answers.GCPS1M_6); // Daily activities
  const item7 = getNumericValue(answers.GCPS1M_7); // Social activities
  const item8 = getNumericValue(answers.GCPS1M_8); // Work

  const mean = (item6 + item7 + item8) / 3;
  return Math.round(mean * 10);
}

/**
 * Convert interference score to points (0-3)
 * 0-29 → 0 points
 * 30-49 → 1 point
 * 50-69 → 2 points
 * 70+ → 3 points
 */
export function getInterferencePoints(score: number): number {
  if (score < 30) return 0;
  if (score < 50) return 1;
  if (score < 70) return 2;
  return 3;
}

/**
 * Convert disability days to points (0-3)
 * 0-1 days → 0 points
 * 2 days → 1 point
 * 3-5 days → 2 points
 * 6+ days → 3 points
 */
export function getDisabilityDaysPoints(days: number): number {
  if (days <= 1) return 0;
  if (days === 2) return 1;
  if (days <= 5) return 2;
  return 3;
}

/**
 * Determine Chronic Pain Grade (0-IV) based on CPI and disability points
 *
 * Grade 0: CPI = 0 (no pain)
 * Grade I: CPI < 50, disability points < 3 (low intensity)
 * Grade II: CPI >= 50, disability points < 3 (high intensity)
 * Grade III: disability points 3-4 (moderately limiting)
 * Grade IV: disability points 5-6 (severely limiting)
 */
export function determineGrade(cpi: number, totalDisabilityPoints: number): GCPSGrade {
  // Grade 0: No pain
  if (cpi === 0) return 0;

  // Grade III & IV: Based on high disability points (takes precedence)
  if (totalDisabilityPoints >= 5) return 4;
  if (totalDisabilityPoints >= 3) return 3;

  // Grade I & II: Based on pain intensity (low disability)
  if (cpi >= 50) return 2;
  return 1;
}

/**
 * Calculate complete GCPS-1M score from answers
 */
export function calculateGCPS1MScore(answers: GCPS1MAnswers): GCPS1MScore {
  // Calculate CPI
  const cpi = calculateCPI(answers);
  const cpiLevel = getCPILevel(cpi);

  // Calculate Interference
  const interferenceScore = calculateInterferenceScore(answers);
  const interferencePoints = getInterferencePoints(interferenceScore);

  // Get disability days
  const disabilityDays = getNumericValue(answers.GCPS1M_5);
  const disabilityDaysPoints = getDisabilityDaysPoints(disabilityDays);

  // Calculate total disability points
  const totalDisabilityPoints = interferencePoints + disabilityDaysPoints;

  // Determine grade
  const grade = determineGrade(cpi, totalDisabilityPoints);
  const gradeInterpretation = GRADE_INTERPRETATIONS[grade];

  return {
    cpi,
    cpiLevel,
    interferenceScore,
    interferencePoints,
    disabilityDays,
    disabilityDaysPoints,
    totalDisabilityPoints,
    grade,
    gradeInterpretation,
  };
}
