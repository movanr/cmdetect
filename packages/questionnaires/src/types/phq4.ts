/**
 * PHQ-4 (Patient Health Questionnaire-4) specific types
 */
import type { ScoredOption } from "./common";

/**
 * PHQ-4 option type (alias for ScoredOption)
 * Kept for backwards compatibility with existing code
 */
export type PHQ4Option = ScoredOption;

/**
 * PHQ-4 question IDs
 * - PHQ4_A, PHQ4_B: Depression subscale (PHQ-2)
 * - PHQ4_C, PHQ4_D: Anxiety subscale (GAD-2)
 */
export type PHQ4QuestionId = "PHQ4_A" | "PHQ4_B" | "PHQ4_C" | "PHQ4_D";

/**
 * PHQ-4 question definition
 */
export type PHQ4Question = {
  id: PHQ4QuestionId;
  text: string; // German
};

/**
 * Complete PHQ-4 questionnaire structure
 */
export type PHQ4Questionnaire = {
  id: string;
  title: string;
  instruction: string;
  questions: PHQ4Question[];
  options: ScoredOption[];
};

/**
 * PHQ-4 answers map
 */
export type PHQ4Answers = Partial<Record<PHQ4QuestionId, string>>;

/**
 * PHQ-4 calculated scores
 */
export type PHQ4Score = {
  /** Total score (0-12) */
  total: number;
  /** Maximum possible total */
  maxTotal: number;
  /** GAD-2 subscale score (PHQ4_C + PHQ4_D, 0-6) */
  anxiety: number;
  /** Maximum anxiety subscale */
  maxAnxiety: number;
  /** PHQ-2 subscale score (PHQ4_A + PHQ4_B, 0-6) */
  depression: number;
  /** Maximum depression subscale */
  maxDepression: number;
};

/**
 * PHQ-4 severity levels
 */
export type PHQ4Severity = "none" | "mild" | "moderate" | "severe";

/**
 * PHQ-4 interpretation with German text
 */
export type PHQ4Interpretation = {
  severity: PHQ4Severity;
  text: string; // German
};

/**
 * PHQ-4 subscale screening result
 */
export type PHQ4SubscaleResult = {
  /** Whether the subscale is positive (score >= 3) */
  positive: boolean;
  /** German text describing the result */
  text: string;
};
