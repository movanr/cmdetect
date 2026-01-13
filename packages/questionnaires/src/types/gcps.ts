/**
 * GCPS (Graded Chronic Pain Scale) types
 * Version 2.0 (2013-05-12)
 * Source: inform-iadr.com / DC/TMD
 */

/**
 * GCPS 1-month question IDs (8 questions)
 * - GCPS1M_1: Days with facial pain in last 6 months (numeric, 0-180)
 * - GCPS1M_2: Current pain RIGHT NOW (0-10)
 * - GCPS1M_3: Worst pain in last 30 days (0-10)
 * - GCPS1M_4: Average pain in last 30 days (0-10)
 * - GCPS1M_5: Days kept from activities in last 30 days (numeric, 0-30)
 * - GCPS1M_6: Interference with daily activities (0-10)
 * - GCPS1M_7: Interference with social activities (0-10)
 * - GCPS1M_8: Interference with work (0-10)
 */
export type GCPS1MQuestionId =
  | "GCPS1M_1"
  | "GCPS1M_2"
  | "GCPS1M_3"
  | "GCPS1M_4"
  | "GCPS1M_5"
  | "GCPS1M_6"
  | "GCPS1M_7"
  | "GCPS1M_8";

/**
 * Scale question (0-10 pain/interference scale)
 */
export type GCPS1MScaleQuestion = {
  id: GCPS1MQuestionId;
  type: "scale_0_10";
  text: string;
  note?: string;
  scaleLabels: {
    min: string; // Label for 0
    max: string; // Label for 10
  };
};

/**
 * Numeric input question (days)
 */
export type GCPS1MNumericQuestion = {
  id: GCPS1MQuestionId;
  type: "numeric";
  text: string;
  note?: string;
  range: { min: number; max: number };
  unit: string;
};

/**
 * Union type for all GCPS 1-month question types
 */
export type GCPS1MQuestion = GCPS1MScaleQuestion | GCPS1MNumericQuestion;

/**
 * Complete GCPS 1-month questionnaire structure
 */
export type GCPS1MQuestionnaire = {
  id: string;
  title: string;
  version: string;
  source: string;
  timeframe: string;
  questions: GCPS1MQuestion[];
};

/**
 * GCPS 1-month answers map
 * Values are strings for 0-10 scale, numbers for days
 */
export type GCPS1MAnswers = Partial<Record<GCPS1MQuestionId, string | number>>;

/**
 * GCPS Chronic Pain Grade (0-IV)
 */
export type GCPSGrade = 0 | 1 | 2 | 3 | 4;

/**
 * GCPS Grade interpretation with labels
 */
export type GCPSGradeInterpretation = {
  grade: GCPSGrade;
  label: string; // e.g., "Low Intensity", "High Intensity"
  labelDe: string; // German label
};

/**
 * CPI (Characteristic Pain Intensity) interpretation
 */
export type GCPSCPILevel = "none" | "low" | "high";

/**
 * GCPS 1-month calculated scores
 */
export type GCPS1MScore = {
  /** Characteristic Pain Intensity (mean of items 2-4 × 10), range 0-100 */
  cpi: number;
  /** CPI level interpretation */
  cpiLevel: GCPSCPILevel;
  /** Interference Score (mean of items 6-8 × 10), range 0-100 */
  interferenceScore: number;
  /** Interference points derived from score (0-3) */
  interferencePoints: number;
  /** Disability days from item 5 */
  disabilityDays: number;
  /** Disability days points (0-3) */
  disabilityDaysPoints: number;
  /** Total disability points (interference + days), range 0-6 */
  totalDisabilityPoints: number;
  /** Final Chronic Pain Grade (0-IV) */
  grade: GCPSGrade;
  /** Grade interpretation */
  gradeInterpretation: GCPSGradeInterpretation;
};
