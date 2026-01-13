/**
 * PHQ-4 Question Definitions (German)
 * Source: Prof. Dr. Bernd Lowe, 2015, Universitatsklinikum Hamburg-Eppendorf
 */
import type { PHQ4Question, PHQ4QuestionId, PHQ4Questionnaire } from "../types";
import { PHQ4_OPTIONS } from "./options";

/**
 * PHQ-4 questions indexed by ID
 */
export const PHQ4_QUESTIONS: Record<PHQ4QuestionId, PHQ4Question> = {
  PHQ4_A: {
    id: "PHQ4_A",
    text: "Wenig Interesse oder Freude an Ihren Tätigkeiten",
  },
  PHQ4_B: {
    id: "PHQ4_B",
    text: "Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit",
  },
  PHQ4_C: {
    id: "PHQ4_C",
    text: "Nervosität, Ängstlichkeit oder Anspannung",
  },
  PHQ4_D: {
    id: "PHQ4_D",
    text: "Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren",
  },
};

/**
 * PHQ-4 question order (for rendering)
 * Official order: GAD-2 (anxiety) first, then PHQ-2 (depression)
 * 1-2: Anxiety (C, D)
 * 3-4: Depression (A, B)
 */
export const PHQ4_QUESTION_ORDER: PHQ4QuestionId[] = [
  "PHQ4_C", // 1. Nervosität, Ängstlichkeit oder Anspannung
  "PHQ4_D", // 2. Nicht in der Lage sein, Sorgen zu stoppen
  "PHQ4_A", // 3. Wenig Interesse oder Freude
  "PHQ4_B", // 4. Niedergeschlagenheit, Schwermut
];

/**
 * PHQ-4 questionnaire metadata
 */
export const PHQ4_METADATA = {
  id: "phq-4",
  title: "PHQ-4 Gesundheitsfragebogen",
  version: "1.0",
  instruction:
    "Wie oft fühlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeinträchtigt?",
} as const;

/**
 * Total number of PHQ-4 questions
 */
export const PHQ4_TOTAL_QUESTIONS = PHQ4_QUESTION_ORDER.length;

/**
 * Complete PHQ-4 questionnaire structure
 * Combines questions, options, and metadata for easy consumption
 */
export const PHQ4_QUESTIONNAIRE: PHQ4Questionnaire = {
  id: PHQ4_METADATA.id,
  title: PHQ4_METADATA.title,
  instruction: PHQ4_METADATA.instruction,
  questions: PHQ4_QUESTION_ORDER.map((id) => PHQ4_QUESTIONS[id]),
  options: PHQ4_OPTIONS,
};
