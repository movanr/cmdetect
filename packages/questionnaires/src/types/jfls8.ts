/**
 * JFLS-8 (Jaw Functional Limitation Scale - 8 items) types
 * Version: 12/2018
 * Source: Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org
 */

/**
 * JFLS-8 question IDs (8 questions)
 * All questions use 0-10 limitation scale
 */
export type JFLS8QuestionId =
  | "JFLS8_1"
  | "JFLS8_2"
  | "JFLS8_3"
  | "JFLS8_4"
  | "JFLS8_5"
  | "JFLS8_6"
  | "JFLS8_7"
  | "JFLS8_8";

/**
 * JFLS-8 question (all are 0-10 scale)
 */
export type JFLS8Question = {
  id: JFLS8QuestionId;
  type: "scale_0_10";
  text: string;
  scaleLabels: {
    min: string;
    max: string;
  };
  skippable?: boolean;
};

/**
 * Complete JFLS-8 questionnaire structure
 */
export type JFLS8Questionnaire = {
  id: string;
  title: string;
  version: string;
  source: string;
  timeframe: string;
  instructions: string[];
  questions: JFLS8Question[];
};

/**
 * JFLS-8 answers map
 * Values are strings for 0-10 scale
 */
export type JFLS8Answers = Partial<Record<JFLS8QuestionId, string>>;

import { z } from "zod";
import {
  JFLS8LimitationLevelSchema,
  JFLS8LimitationInterpretationSchema,
  JFLS8ScoreSchema,
} from "../schemas/scores";

/**
 * JFLS-8 limitation level based on reference values
 * - normal: <0.5 (within healthy range, ref: 0.16)
 * - mild: 0.5-1.5 (between healthy and chronic TMD)
 * - significant: ≥1.5 (chronic TMD range, ref: 1.74)
 * Derived from Zod schema for single source of truth.
 */
export type JFLS8LimitationLevel = z.infer<typeof JFLS8LimitationLevelSchema>;

/**
 * JFLS-8 limitation interpretation (German only)
 * Derived from Zod schema for single source of truth.
 */
export type JFLS8LimitationInterpretation = z.infer<typeof JFLS8LimitationInterpretationSchema>;

/**
 * Complete JFLS-8 score result
 * Derived from Zod schema for single source of truth.
 */
export type JFLS8Score = z.infer<typeof JFLS8ScoreSchema>;
