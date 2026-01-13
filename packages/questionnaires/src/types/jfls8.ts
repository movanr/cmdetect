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
