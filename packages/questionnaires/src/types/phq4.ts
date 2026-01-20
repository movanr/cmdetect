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
  type: "choice";
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

import { z } from "zod";
import {
  PHQ4SeveritySchema,
  PHQ4ScoreSchema,
  PHQ4InterpretationSchema,
  PHQ4SubscaleResultSchema,
} from "../schemas/scores";

/**
 * PHQ-4 calculated scores
 * Derived from Zod schema for single source of truth.
 */
export type PHQ4Score = z.infer<typeof PHQ4ScoreSchema>;

/**
 * PHQ-4 severity levels
 * Derived from Zod schema for single source of truth.
 */
export type PHQ4Severity = z.infer<typeof PHQ4SeveritySchema>;

/**
 * PHQ-4 interpretation with label (German only)
 * Derived from Zod schema for single source of truth.
 */
export type PHQ4Interpretation = z.infer<typeof PHQ4InterpretationSchema>;

/**
 * PHQ-4 subscale screening result
 * Derived from Zod schema for single source of truth.
 */
export type PHQ4SubscaleResult = z.infer<typeof PHQ4SubscaleResultSchema>;
