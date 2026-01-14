/**
 * JFLS-20 Question Definitions (German)
 * Jaw Functional Limitation Scale - 20 items
 * Version: 12/2018
 * Source: Copyright Ohrbach R. Deutsche Übersetzung: Asendorf A, Eberhard L,
 *         Universitätsklinikum Heidelberg & Schierz O, Universitätsmedizin Leipzig.
 */
import { QUESTIONNAIRE_ID } from "..";
import type { JFLS20Question, JFLS20QuestionId, JFLS20Questionnaire } from "../types";
import { JFLS20_SCALE_LABELS } from "./options";

/**
 * JFLS-20 questions indexed by ID
 */
export const JFLS20_QUESTIONS: Record<JFLS20QuestionId, JFLS20Question> = {
  JFLS20_1: {
    id: "JFLS20_1",
    type: "scale_0_10",
    text: "Zähe Nahrung kauen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_2: {
    id: "JFLS20_2",
    type: "scale_0_10",
    text: "Hartes Brot kauen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_3: {
    id: "JFLS20_3",
    type: "scale_0_10",
    text: "Hühnchen kauen (z.B. nach Zubereitung im Backofen)",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_4: {
    id: "JFLS20_4",
    type: "scale_0_10",
    text: "Kräcker/ Kekse kauen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_5: {
    id: "JFLS20_5",
    type: "scale_0_10",
    text: "Weiche Speisen kauen (z.B. Nudeln, eingemachte oder weiche Früchte, gekochtes Gemüse, Fisch)",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_6: {
    id: "JFLS20_6",
    type: "scale_0_10",
    text: "Weiche Nahrung essen, die nicht gekaut werden muss (z.B. Kartoffelpüree, Apfelmus, Pudding, pürierte Nahrung)",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_7: {
    id: "JFLS20_7",
    type: "scale_0_10",
    text: "Weit genug den Mund öffnen, um von einem ganzen Apfel abzubeißen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_8: {
    id: "JFLS20_8",
    type: "scale_0_10",
    text: "Weit genug den Mund öffnen, um in ein belegtes Brot zu beißen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_9: {
    id: "JFLS20_9",
    type: "scale_0_10",
    text: "Weit genug den Mund öffnen, um zu reden",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_10: {
    id: "JFLS20_10",
    type: "scale_0_10",
    text: "Weit genug den Mund öffnen, um aus einer Tasse zu trinken",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_11: {
    id: "JFLS20_11",
    type: "scale_0_10",
    text: "Schlucken",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_12: {
    id: "JFLS20_12",
    type: "scale_0_10",
    text: "Gähnen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_13: {
    id: "JFLS20_13",
    type: "scale_0_10",
    text: "Sprechen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_14: {
    id: "JFLS20_14",
    type: "scale_0_10",
    text: "Singen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_15: {
    id: "JFLS20_15",
    type: "scale_0_10",
    text: "Fröhliches Gesicht machen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_16: {
    id: "JFLS20_16",
    type: "scale_0_10",
    text: "Wütendes Gesicht machen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_17: {
    id: "JFLS20_17",
    type: "scale_0_10",
    text: "Stirnrunzeln",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_18: {
    id: "JFLS20_18",
    type: "scale_0_10",
    text: "Küssen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_19: {
    id: "JFLS20_19",
    type: "scale_0_10",
    text: "Lächeln",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
  JFLS20_20: {
    id: "JFLS20_20",
    type: "scale_0_10",
    text: "Lachen",
    scaleLabels: JFLS20_SCALE_LABELS,
    skippable: true,
  },
};

/**
 * JFLS-20 question order (for rendering)
 */
export const JFLS20_QUESTION_ORDER: JFLS20QuestionId[] = [
  "JFLS20_1",
  "JFLS20_2",
  "JFLS20_3",
  "JFLS20_4",
  "JFLS20_5",
  "JFLS20_6",
  "JFLS20_7",
  "JFLS20_8",
  "JFLS20_9",
  "JFLS20_10",
  "JFLS20_11",
  "JFLS20_12",
  "JFLS20_13",
  "JFLS20_14",
  "JFLS20_15",
  "JFLS20_16",
  "JFLS20_17",
  "JFLS20_18",
  "JFLS20_19",
  "JFLS20_20",
];

/**
 * JFLS-20 questionnaire metadata
 */
export const JFLS20_METADATA = {
  id: QUESTIONNAIRE_ID.JFLS20,
  title: "JFLS-20 - Kieferfunktions-Einschränkungsskala",
  version: "12/2018",
  source: "Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org",
  timeframe: "1-month",
} as const;

/**
 * Instructions (German)
 */
export const JFLS20_INSTRUCTIONS = [
  "Bitte geben Sie für jeden der untenstehenden Punkte den Grad der Einschränkung innerhalb des letzten Monats an.",
  'Falls die Aktivität vollständig vermieden wurde, weil sie zu schwierig war, kreuzen Sie „10" an.',
  "Wenn Sie eine Aktivität aus anderen Gründen als Schmerzen oder Schwierigkeiten vermieden haben, lassen Sie den Punkt unmarkiert.",
] as const;

/**
 * Total number of JFLS-20 questions
 */
export const JFLS20_TOTAL_QUESTIONS = JFLS20_QUESTION_ORDER.length;

/**
 * Complete JFLS-20 questionnaire structure
 */
export const JFLS20_QUESTIONNAIRE: JFLS20Questionnaire = {
  id: JFLS20_METADATA.id,
  title: JFLS20_METADATA.title,
  version: JFLS20_METADATA.version,
  source: JFLS20_METADATA.source,
  timeframe: JFLS20_METADATA.timeframe,
  instructions: [...JFLS20_INSTRUCTIONS],
  questions: JFLS20_QUESTION_ORDER.map((id) => JFLS20_QUESTIONS[id]),
};

/**
 * Question labels map (short labels for practitioner display)
 */
export const JFLS20_QUESTION_LABELS: Record<JFLS20QuestionId, string> = {
  JFLS20_1: "Zähe Nahrung kauen",
  JFLS20_2: "Hartes Brot kauen",
  JFLS20_3: "Hühnchen kauen",
  JFLS20_4: "Kräcker/Kekse kauen",
  JFLS20_5: "Weiche Speisen kauen",
  JFLS20_6: "Weiche Nahrung essen",
  JFLS20_7: "Mund öffnen (Apfel)",
  JFLS20_8: "Mund öffnen (Brot)",
  JFLS20_9: "Mund öffnen (Reden)",
  JFLS20_10: "Mund öffnen (Tasse)",
  JFLS20_11: "Schlucken",
  JFLS20_12: "Gähnen",
  JFLS20_13: "Sprechen",
  JFLS20_14: "Singen",
  JFLS20_15: "Fröhliches Gesicht",
  JFLS20_16: "Wütendes Gesicht",
  JFLS20_17: "Stirnrunzeln",
  JFLS20_18: "Küssen",
  JFLS20_19: "Lächeln",
  JFLS20_20: "Lachen",
};
