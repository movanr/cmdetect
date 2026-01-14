/**
 * OBC Question Definitions (German)
 * Oral Behaviors Checklist
 * Version: 12/2018
 * Source: Copyright Ohrbach R. Deutsche Übersetzung: Asendorf A, Eberhard L,
 *         Universitätsklinikum Heidelberg & Schierz O, Universitätsmedizin Leipzig.
 */
import { QUESTIONNAIRE_ID } from "..";
import type { OBCQuestion, OBCQuestionId, OBCQuestionnaire } from "../types";
import { OBC_SECTIONS, OBC_SECTION_ORDER } from "./sections";

/**
 * OBC questions indexed by ID
 */
export const OBC_QUESTIONS: Record<OBCQuestionId, OBCQuestion> = {
  // Sleep activities (items 1-2)
  OBC_1: {
    id: "OBC_1",
    type: "choice",
    section: "sleep",
    text: "Pressen oder Knirschen mit den Zähnen während des Schlafs, basierend auf jeglichen verfügbaren Informationen",
  },
  OBC_2: {
    id: "OBC_2",
    type: "choice",
    section: "sleep",
    text: "Schlafen in einer Position, die Druck auf den Kiefer ausübt (z.B. auf dem Bauch oder auf der Seite)",
  },
  // Waking activities (items 3-21)
  OBC_3: {
    id: "OBC_3",
    type: "choice",
    section: "waking",
    text: "Im Wachzustand mit den Zähnen knirschen",
  },
  OBC_4: {
    id: "OBC_4",
    type: "choice",
    section: "waking",
    text: "Im Wachzustand die Zähne zusammenpressen",
  },
  OBC_5: {
    id: "OBC_5",
    type: "choice",
    section: "waking",
    text: "Pressen, Berühren oder Zusammenhalten der Zähne außer beim Essen (gemeint ist der Kontakt zwischen Zähnen des Ober- und Unterkiefers)",
  },
  OBC_6: {
    id: "OBC_6",
    type: "choice",
    section: "waking",
    text: "Halten, Verspannen oder Anspannen der Muskulatur ohne Pressen oder Aufeinanderhalten der Zähne",
  },
  OBC_7: {
    id: "OBC_7",
    type: "choice",
    section: "waking",
    text: "Den Kiefer nach vorn oder zur Seite halten oder schieben",
  },
  OBC_8: {
    id: "OBC_8",
    type: "choice",
    section: "waking",
    text: "Die Zunge kraftvoll gegen die Zähne pressen",
  },
  OBC_9: {
    id: "OBC_9",
    type: "choice",
    section: "waking",
    text: "Die Zunge zwischen die Zahnreihen legen",
  },
  OBC_10: {
    id: "OBC_10",
    type: "choice",
    section: "waking",
    text: "Auf Ihre Zunge, Wange oder Lippen beißen, kauen oder mit ihnen spielen",
  },
  OBC_11: {
    id: "OBC_11",
    type: "choice",
    section: "waking",
    text: "Den Kiefer in einer starren oder angespannten Position halten, wie um den Kiefer zu stützen oder zu schützen",
  },
  OBC_12: {
    id: "OBC_12",
    type: "choice",
    section: "waking",
    text: "Objekte wie Haare, Pfeife, Bleistift, Stifte, Finger, Fingernägel usw. zwischen den Zähnen halten oder darauf beißen",
  },
  OBC_13: {
    id: "OBC_13",
    type: "choice",
    section: "waking",
    text: "Kaugummikauen",
  },
  OBC_14: {
    id: "OBC_14",
    type: "choice",
    section: "waking",
    text: "Spielen eines Musikinstruments, bei dem der Mund oder Kiefer beansprucht wird (z.B. Holz-, Blechblas-, Streichinstrumente)",
  },
  OBC_15: {
    id: "OBC_15",
    type: "choice",
    section: "waking",
    text: "Sich mit Ihrer Hand auf den Kiefer lehnen, wie beim Stützen oder Ausruhen des Kinns in der Hand",
  },
  OBC_16: {
    id: "OBC_16",
    type: "choice",
    section: "waking",
    text: "Kauen von Nahrung nur auf einer Seite",
  },
  OBC_17: {
    id: "OBC_17",
    type: "choice",
    section: "waking",
    text: "Essen zwischen den Mahlzeiten (gemeint ist Nahrung, die gekaut werden muss)",
  },
  OBC_18: {
    id: "OBC_18",
    type: "choice",
    section: "waking",
    text: "Anhaltendes Sprechen (z.B. Lehrtätigkeit, Verkauf, Kundenservice)",
  },
  OBC_19: {
    id: "OBC_19",
    type: "choice",
    section: "waking",
    text: "Singen",
  },
  OBC_20: {
    id: "OBC_20",
    type: "choice",
    section: "waking",
    text: "Gähnen",
  },
  OBC_21: {
    id: "OBC_21",
    type: "choice",
    section: "waking",
    text: "Halten des Telefons zwischen Ihrem Kopf und Ihren Schultern",
  },
};

/**
 * OBC question order (for rendering)
 */
export const OBC_QUESTION_ORDER: OBCQuestionId[] = [
  "OBC_1",
  "OBC_2",
  "OBC_3",
  "OBC_4",
  "OBC_5",
  "OBC_6",
  "OBC_7",
  "OBC_8",
  "OBC_9",
  "OBC_10",
  "OBC_11",
  "OBC_12",
  "OBC_13",
  "OBC_14",
  "OBC_15",
  "OBC_16",
  "OBC_17",
  "OBC_18",
  "OBC_19",
  "OBC_20",
  "OBC_21",
];

/**
 * OBC questionnaire metadata
 */
export const OBC_METADATA = {
  id: QUESTIONNAIRE_ID.OBC,
  title: "OBC - Oral Behaviors Checklist",
  version: "12/2018",
  source: "Copyright Ohrbach R. Verfügbar unter http://www.rdc-tmdinternational.org",
  timeframe: "1-month",
} as const;

/**
 * OBC instructions (German)
 */
export const OBC_INSTRUCTIONS = [
  "Wie oft haben Sie, im letzten Monat, jede der folgenden Aktivitäten ausgeführt?",
  "Falls die Häufigkeit der Aktivität variiert, wählen Sie bitte die höhere Option aus.",
] as const;

/**
 * Total number of OBC questions
 */
export const OBC_TOTAL_QUESTIONS = OBC_QUESTION_ORDER.length;

/**
 * Complete OBC questionnaire structure
 */
export const OBC_QUESTIONNAIRE: OBCQuestionnaire = {
  id: OBC_METADATA.id,
  title: OBC_METADATA.title,
  version: OBC_METADATA.version,
  source: OBC_METADATA.source,
  timeframe: OBC_METADATA.timeframe,
  instructions: [...OBC_INSTRUCTIONS],
  sections: OBC_SECTION_ORDER.map((id) => OBC_SECTIONS[id]),
  questions: OBC_QUESTION_ORDER.map((id) => OBC_QUESTIONS[id]),
};

/**
 * Question labels map (short labels for practitioner display)
 */
export const OBC_QUESTION_LABELS: Record<OBCQuestionId, string> = {
  OBC_1: "Zähnepressen/-knirschen (Schlaf)",
  OBC_2: "Schlafposition (Druck auf Kiefer)",
  OBC_3: "Zähneknirschen (wach)",
  OBC_4: "Zähne zusammenpressen (wach)",
  OBC_5: "Zahnkontakt außer beim Essen",
  OBC_6: "Muskelanspannung ohne Zahnkontakt",
  OBC_7: "Kiefer nach vorn/zur Seite",
  OBC_8: "Zunge gegen Zähne pressen",
  OBC_9: "Zunge zwischen Zahnreihen",
  OBC_10: "Auf Zunge/Wange/Lippen beißen",
  OBC_11: "Kiefer starr/angespannt halten",
  OBC_12: "Auf Objekte beißen",
  OBC_13: "Kaugummikauen",
  OBC_14: "Musikinstrument (Mund/Kiefer)",
  OBC_15: "Kinn auf Hand stützen",
  OBC_16: "Einseitiges Kauen",
  OBC_17: "Essen zwischen Mahlzeiten",
  OBC_18: "Anhaltendes Sprechen",
  OBC_19: "Singen",
  OBC_20: "Gähnen",
  OBC_21: "Telefon zwischen Kopf/Schulter",
};
