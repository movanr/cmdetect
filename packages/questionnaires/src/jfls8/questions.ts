/**
 * JFLS-8 Question Definitions (German)
 * Jaw Functional Limitation Scale - 8 items
 * Version: 12/2018
 * Source: Copyright Ohrbach R. Deutsche Übersetzung: Asendorf A, Eberhard L,
 *         Universitätsklinikum Heidelberg & Schierz O, Universitätsmedizin Leipzig.
 */
import type {
  JFLS8Question,
  JFLS8QuestionId,
  JFLS8Questionnaire,
} from "../types";
import { JFLS8_SCALE_LABELS } from "./options";

/**
 * JFLS-8 questions indexed by ID
 */
export const JFLS8_QUESTIONS: Record<JFLS8QuestionId, JFLS8Question> = {
  JFLS8_1: {
    id: "JFLS8_1",
    type: "scale_0_10",
    text: "Zähe Nahrung kauen",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
  JFLS8_2: {
    id: "JFLS8_2",
    type: "scale_0_10",
    text: "Hühnchen kauen (z.B. nach Zubereitung im Backofen)",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
  JFLS8_3: {
    id: "JFLS8_3",
    type: "scale_0_10",
    text: "Weiche Nahrung essen, die nicht gekaut werden muss (z.B. Kartoffelpüree, Apfelmus, Pudding, pürierte Nahrung)",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
  JFLS8_4: {
    id: "JFLS8_4",
    type: "scale_0_10",
    text: "Weit genug den Mund öffnen, um aus einer Tasse zu trinken",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
  JFLS8_5: {
    id: "JFLS8_5",
    type: "scale_0_10",
    text: "Schlucken",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
  JFLS8_6: {
    id: "JFLS8_6",
    type: "scale_0_10",
    text: "Gähnen",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
  JFLS8_7: {
    id: "JFLS8_7",
    type: "scale_0_10",
    text: "Sprechen",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
  JFLS8_8: {
    id: "JFLS8_8",
    type: "scale_0_10",
    text: "Lächeln",
    scaleLabels: JFLS8_SCALE_LABELS,
  },
};

/**
 * JFLS-8 question order (for rendering)
 */
export const JFLS8_QUESTION_ORDER: JFLS8QuestionId[] = [
  "JFLS8_1",
  "JFLS8_2",
  "JFLS8_3",
  "JFLS8_4",
  "JFLS8_5",
  "JFLS8_6",
  "JFLS8_7",
  "JFLS8_8",
];

/**
 * JFLS-8 questionnaire metadata
 */
export const JFLS8_METADATA = {
  id: "jfls-8",
  title: "JFLS-8 - Kieferfunktions-Einschränkungsskala",
  version: "12/2018",
  source: "Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org",
  timeframe: "1-month",
} as const;

/**
 * Instructions (German)
 */
export const JFLS8_INSTRUCTIONS = [
  "Bitte geben Sie für jeden der untenstehenden Punkte den Grad der Einschränkung innerhalb des letzten Monats an.",
  "Falls die Aktivität vollständig vermieden wurde, weil sie zu schwierig war, kreuzen Sie '10' an.",
  "Wenn Sie eine Aktivität aus anderen Gründen als Schmerzen oder Schwierigkeiten, vermieden haben, lassen Sie den Punkt unmarkiert.",
] as const;

/**
 * Total number of JFLS-8 questions
 */
export const JFLS8_TOTAL_QUESTIONS = JFLS8_QUESTION_ORDER.length;

/**
 * Complete JFLS-8 questionnaire structure
 */
export const JFLS8_QUESTIONNAIRE: JFLS8Questionnaire = {
  id: JFLS8_METADATA.id,
  title: JFLS8_METADATA.title,
  version: JFLS8_METADATA.version,
  source: JFLS8_METADATA.source,
  timeframe: JFLS8_METADATA.timeframe,
  instructions: [...JFLS8_INSTRUCTIONS],
  questions: JFLS8_QUESTION_ORDER.map((id) => JFLS8_QUESTIONS[id]),
};

/**
 * Question labels map (short labels for practitioner display)
 */
export const JFLS8_QUESTION_LABELS: Record<JFLS8QuestionId, string> = {
  JFLS8_1: "Zähe Nahrung kauen",
  JFLS8_2: "Hühnchen kauen",
  JFLS8_3: "Weiche Nahrung essen",
  JFLS8_4: "Mund öffnen (Tasse)",
  JFLS8_5: "Schlucken",
  JFLS8_6: "Gähnen",
  JFLS8_7: "Sprechen",
  JFLS8_8: "Lächeln",
};
