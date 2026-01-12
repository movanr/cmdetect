/**
 * PHQ-4 Questionnaire Feature
 */

import type { QuestionnaireMetadata } from "../questionnaire-core";

// Questionnaire metadata for submission
export const PHQ4_METADATA: QuestionnaireMetadata = {
  id: "phq-4",
  version: "1.0",
  title: "Gesundheitsfragebogen für Patienten (PHQ-4)",
};

export { PHQ4Wizard } from "./components/PHQ4Wizard";
export { usePHQ4Form } from "./hooks/usePHQ4Form";
export { loadProgress, clearProgress } from "./persistence/storage";
export { PHQ4_QUESTIONNAIRE } from "./data/phq4Questions";
export type { PHQ4Answers } from "./model/answer";
