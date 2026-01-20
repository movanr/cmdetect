/**
 * JFLS-20 (Jaw Functional Limitation Scale - 20 items) types
 * Version: 12/2018
 * Source: Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org
 */

/**
 * JFLS-20 question IDs (20 questions)
 * All questions use 0-10 limitation scale
 */
export type JFLS20QuestionId =
  | "JFLS20_1"
  | "JFLS20_2"
  | "JFLS20_3"
  | "JFLS20_4"
  | "JFLS20_5"
  | "JFLS20_6"
  | "JFLS20_7"
  | "JFLS20_8"
  | "JFLS20_9"
  | "JFLS20_10"
  | "JFLS20_11"
  | "JFLS20_12"
  | "JFLS20_13"
  | "JFLS20_14"
  | "JFLS20_15"
  | "JFLS20_16"
  | "JFLS20_17"
  | "JFLS20_18"
  | "JFLS20_19"
  | "JFLS20_20";

/**
 * JFLS-20 question (all are 0-10 scale)
 */
export type JFLS20Question = {
  id: JFLS20QuestionId;
  type: "scale_0_10";
  text: string;
  scaleLabels: {
    min: string;
    max: string;
  };
  skippable?: boolean;
};

/**
 * Complete JFLS-20 questionnaire structure
 */
export type JFLS20Questionnaire = {
  id: string;
  title: string;
  version: string;
  source: string;
  timeframe: string;
  instructions: string[];
  questions: JFLS20Question[];
};

/**
 * JFLS-20 answers map
 * Values are strings for 0-10 scale
 */
export type JFLS20Answers = Partial<Record<JFLS20QuestionId, string>>;

import { z } from "zod";
import {
  JFLS20LimitationLevelSchema,
  JFLS20LimitationInterpretationSchema,
  JFLS20SubscaleScoreSchema,
  JFLS20ScoreSchema,
} from "../schemas/scores";

/**
 * JFLS-20 limitation level (same as JFLS-8)
 * Derived from Zod schema for single source of truth.
 */
export type JFLS20LimitationLevel = z.infer<typeof JFLS20LimitationLevelSchema>;

/**
 * JFLS-20 limitation interpretation (German only)
 * Derived from Zod schema for single source of truth.
 */
export type JFLS20LimitationInterpretation = z.infer<typeof JFLS20LimitationInterpretationSchema>;

/**
 * JFLS-20 subscale identifiers
 * - Mastication: items 1-6
 * - Mobility: items 7-10
 * - Communication: items 13-20
 * Note: items 11-12 are not in any subscale
 */
export type JFLS20SubscaleId = "mastication" | "mobility" | "communication";

/**
 * JFLS-20 subscale score result
 * Derived from Zod schema for single source of truth.
 */
export type JFLS20SubscaleScore = z.infer<typeof JFLS20SubscaleScoreSchema>;

/**
 * Complete JFLS-20 score result with subscales
 * Derived from Zod schema for single source of truth.
 */
export type JFLS20Score = z.infer<typeof JFLS20ScoreSchema>;
