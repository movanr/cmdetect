/**
 * PHQ-4 (Patient Health Questionnaire-4) Question Definitions
 * Source: Prof. Dr. Bernd Löwe, 2015, Universitätsklinikum Hamburg-Eppendorf
 */

import type { PHQ4Questionnaire } from "../model/question";

export const PHQ4_QUESTIONNAIRE: PHQ4Questionnaire = {
  id: "phq4",
  title: "Gesundheitsfragebogen für Patienten (PHQ-4)",
  instruction:
    "Wie oft fühlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeinträchtigt?",
  questions: [
    {
      id: "PHQ4_A",
      text: "Wenig Interesse oder Freude an Ihren Tätigkeiten",
    },
    {
      id: "PHQ4_B",
      text: "Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit",
    },
    {
      id: "PHQ4_C",
      text: "Nervosität, Ängstlichkeit oder Anspannung",
    },
    {
      id: "PHQ4_D",
      text: "Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren",
    },
  ],
  options: [
    { value: "0", label: "Überhaupt nicht", score: 0 },
    { value: "1", label: "An einzelnen Tagen", score: 1 },
    { value: "2", label: "An mehr als der Hälfte der Tage", score: 2 },
    { value: "3", label: "Beinahe jeden Tag", score: 3 },
  ],
};

export const PHQ4_TOTAL_QUESTIONS = PHQ4_QUESTIONNAIRE.questions.length;
