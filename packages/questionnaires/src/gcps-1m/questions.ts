/**
 * GCPS 1-Month Question Definitions (German)
 * Graded Chronic Pain Scale Version 2.0
 * Source: inform-iadr.com / DC/TMD
 */
import type {
  GCPS1MQuestion,
  GCPS1MQuestionId,
  GCPS1MQuestionnaire,
} from "../types";
import {
  GCPS_1M_PAIN_LABELS,
  GCPS_1M_INTERFERENCE_LABELS,
  GCPS_1M_DAYS_CONFIG,
  GCPS_1M_6_MONTH_DAYS_CONFIG,
} from "./options";

/**
 * GCPS 1-month questions indexed by ID (8 questions)
 */
export const GCPS_1M_QUESTIONS: Record<GCPS1MQuestionId, GCPS1MQuestion> = {
  GCPS1M_1: {
    id: "GCPS1M_1",
    type: "numeric",
    text: "An wie vielen Tagen in den letzten 6 Monaten hatten Sie Gesichtsschmerzen?",
    range: { min: GCPS_1M_6_MONTH_DAYS_CONFIG.min, max: GCPS_1M_6_MONTH_DAYS_CONFIG.max },
    unit: GCPS_1M_6_MONTH_DAYS_CONFIG.unit,
  },
  GCPS1M_2: {
    id: "GCPS1M_2",
    type: "scale_0_10",
    text: "Wie würden Sie Ihre Gesichtsschmerzen JETZT bewerten?",
    scaleLabels: GCPS_1M_PAIN_LABELS,
  },
  GCPS1M_3: {
    id: "GCPS1M_3",
    type: "scale_0_10",
    text: "Wie würden Sie Ihre STÄRKSTEN Gesichtsschmerzen in den LETZTEN 30 TAGEN bewerten?",
    scaleLabels: GCPS_1M_PAIN_LABELS,
  },
  GCPS1M_4: {
    id: "GCPS1M_4",
    type: "scale_0_10",
    text: "Wie würden Sie Ihre Gesichtsschmerzen in den LETZTEN 30 TAGEN IM DURCHSCHNITT bewerten? [Das heißt, Ihre üblichen Schmerzen zu Zeiten, in denen Sie Schmerzen hatten.]",
    scaleLabels: GCPS_1M_PAIN_LABELS,
  },
  GCPS1M_5: {
    id: "GCPS1M_5",
    type: "numeric",
    text: "An wie vielen Tagen in den LETZTEN 30 TAGEN haben Ihre Gesichtsschmerzen Sie davon abgehalten, Ihren ÜBLICHEN AKTIVITÄTEN wie Arbeit, Schule oder Hausarbeit nachzugehen?",
    note: "jeden Tag = 30 Tage",
    range: { min: GCPS_1M_DAYS_CONFIG.min, max: GCPS_1M_DAYS_CONFIG.max },
    unit: GCPS_1M_DAYS_CONFIG.unit,
  },
  GCPS1M_6: {
    id: "GCPS1M_6",
    type: "scale_0_10",
    text: "Wie sehr haben Gesichtsschmerzen in den LETZTEN 30 TAGEN Ihre TÄGLICHEN AKTIVITÄTEN beeinträchtigt?",
    scaleLabels: GCPS_1M_INTERFERENCE_LABELS,
  },
  GCPS1M_7: {
    id: "GCPS1M_7",
    type: "scale_0_10",
    text: "Wie sehr haben Gesichtsschmerzen in den LETZTEN 30 TAGEN Ihre FREIZEIT-, SOZIAL- UND FAMILIENAKTIVITÄTEN beeinträchtigt?",
    scaleLabels: GCPS_1M_INTERFERENCE_LABELS,
  },
  GCPS1M_8: {
    id: "GCPS1M_8",
    type: "scale_0_10",
    text: "Wie sehr haben Gesichtsschmerzen in den LETZTEN 30 TAGEN Ihre ARBEITSFÄHIGKEIT, einschließlich Hausarbeit, beeinträchtigt?",
    scaleLabels: GCPS_1M_INTERFERENCE_LABELS,
  },
};

/**
 * GCPS 1-month question order (for rendering)
 */
export const GCPS_1M_QUESTION_ORDER: GCPS1MQuestionId[] = [
  "GCPS1M_1",
  "GCPS1M_2",
  "GCPS1M_3",
  "GCPS1M_4",
  "GCPS1M_5",
  "GCPS1M_6",
  "GCPS1M_7",
  "GCPS1M_8",
];

/**
 * GCPS 1-month questionnaire metadata
 */
export const GCPS_1M_METADATA = {
  id: "gcps-1m",
  title: "GCPS - Stufenskala für chronische Schmerzen",
  version: "2.0 (2013-05-12)",
  source: "inform-iadr.com / DC/TMD",
  timeframe: "1-month",
} as const;

/**
 * Total number of GCPS 1-month questions
 */
export const GCPS_1M_TOTAL_QUESTIONS = GCPS_1M_QUESTION_ORDER.length;

/**
 * Complete GCPS 1-month questionnaire structure
 * Combines questions and metadata for easy consumption
 */
export const GCPS_1M_QUESTIONNAIRE: GCPS1MQuestionnaire = {
  id: GCPS_1M_METADATA.id,
  title: GCPS_1M_METADATA.title,
  version: GCPS_1M_METADATA.version,
  source: GCPS_1M_METADATA.source,
  timeframe: GCPS_1M_METADATA.timeframe,
  questions: GCPS_1M_QUESTION_ORDER.map((id) => GCPS_1M_QUESTIONS[id]),
};

/**
 * Question labels map (short labels for practitioner display)
 */
export const GCPS_1M_QUESTION_LABELS: Record<GCPS1MQuestionId, string> = {
  GCPS1M_1: "Tage mit Schmerzen (letzte 6 Monate)",
  GCPS1M_2: "Schmerzen JETZT",
  GCPS1M_3: "STÄRKSTE Schmerzen (letzte 30 Tage)",
  GCPS1M_4: "DURCHSCHNITTLICHE Schmerzen (letzte 30 Tage)",
  GCPS1M_5: "Tage mit eingeschränkten Aktivitäten",
  GCPS1M_6: "Beeinträchtigung täglicher Aktivitäten",
  GCPS1M_7: "Beeinträchtigung sozialer Aktivitäten",
  GCPS1M_8: "Beeinträchtigung der Arbeitsfähigkeit",
};
