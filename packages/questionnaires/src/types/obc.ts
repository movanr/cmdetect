/**
 * OBC (Oral Behaviors Checklist) types
 * Version 12/2018
 * Source: Copyright Ohrbach R. Deutsche Übersetzung: Asendorf A, Eberhard L,
 *         Universitätsklinikum Heidelberg & Schierz O, Universitätsmedizin Leipzig.
 */

/**
 * OBC question IDs (21 questions)
 * - OBC_1-2: Sleep activities
 * - OBC_3-21: Waking activities
 */
export type OBCQuestionId =
  | "OBC_1"
  | "OBC_2"
  | "OBC_3"
  | "OBC_4"
  | "OBC_5"
  | "OBC_6"
  | "OBC_7"
  | "OBC_8"
  | "OBC_9"
  | "OBC_10"
  | "OBC_11"
  | "OBC_12"
  | "OBC_13"
  | "OBC_14"
  | "OBC_15"
  | "OBC_16"
  | "OBC_17"
  | "OBC_18"
  | "OBC_19"
  | "OBC_20"
  | "OBC_21";

/**
 * OBC section identifiers
 * - sleep: Activities during sleep (items 1-2)
 * - waking: Activities while awake (items 3-21)
 */
export type OBCSectionId = "sleep" | "waking";

/**
 * OBC question structure
 */
export type OBCQuestion = {
  id: OBCQuestionId;
  type: "choice";
  section: OBCSectionId;
  text: string;
};

/**
 * OBC section structure with options
 */
export type OBCSection = {
  id: OBCSectionId;
  title: string;
  options: { value: string; label: string; score: number }[];
};

/**
 * OBC answers map
 */
export type OBCAnswers = Partial<Record<OBCQuestionId, string>>;

/**
 * Complete OBC questionnaire structure
 */
export type OBCQuestionnaire = {
  id: string;
  title: string;
  version: string;
  source: string;
  timeframe: string;
  instructions: string[];
  sections: OBCSection[];
  questions: OBCQuestion[];
};

import { z } from "zod";
import {
  OBCRiskLevelSchema,
  OBCRiskInterpretationSchema,
  OBCScoreSchema,
} from "../schemas/scores";

/**
 * OBC risk level based on TMD prevalence comparison
 * - normal: Score 0-16, represents normal behaviors
 * - elevated: Score 17-24, occurs 2x more often in TMD patients
 * - high: Score 25+, occurs 17x more often in TMD patients
 * Derived from Zod schema for single source of truth.
 */
export type OBCRiskLevel = z.infer<typeof OBCRiskLevelSchema>;

/**
 * OBC risk interpretation with label (German only)
 * Derived from Zod schema for single source of truth.
 */
export type OBCRiskInterpretation = z.infer<typeof OBCRiskInterpretationSchema>;

/**
 * Complete OBC score result
 * Derived from Zod schema for single source of truth.
 */
export type OBCScore = z.infer<typeof OBCScoreSchema>;
