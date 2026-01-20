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

import { z } from "zod";
import {
  GCPSGradeSchema,
  GCPSCPILevelSchema,
  GCPSGradeInterpretationSchema,
  GCPS1MScoreSchema,
} from "../schemas/scores";

/**
 * GCPS Chronic Pain Grade (0-IV)
 * Derived from Zod schema for single source of truth.
 */
export type GCPSGrade = z.infer<typeof GCPSGradeSchema>;

/**
 * GCPS Grade interpretation with label (German only)
 * Derived from Zod schema for single source of truth.
 */
export type GCPSGradeInterpretation = z.infer<typeof GCPSGradeInterpretationSchema>;

/**
 * CPI (Characteristic Pain Intensity) interpretation
 * Derived from Zod schema for single source of truth.
 */
export type GCPSCPILevel = z.infer<typeof GCPSCPILevelSchema>;

/**
 * GCPS 1-month calculated scores
 * Derived from Zod schema for single source of truth.
 */
export type GCPS1MScore = z.infer<typeof GCPS1MScoreSchema>;
