/**
 * DC/TMD Symptom Questionnaire (SQ) Feature
 * Public exports
 */

import type { QuestionnaireMetadata } from "../questionnaire-core";

// Questionnaire metadata for submission
export const SQ_METADATA: QuestionnaireMetadata = {
  id: "dc-tmd-sq",
  version: "1.0",
  title: "DC/TMD Symptom Questionnaire",
};

// Components
export { SQWizard } from "./components/SQWizard";

// Hooks
export { useSQForm } from "./hooks/useSQForm";
export { useSQWizardNavigation } from "./hooks/useSQNavigation";
export { filterEnabledAnswers } from "./hooks/evaluateEnableWhen";

// Persistence
export { saveProgress, loadProgress, clearProgress, hasProgress } from "./persistence/storage";

// Data
export { SQ_SCREENS, SQ_SECTIONS, SQ_TOTAL_SCREENS } from "./data/sqQuestions";

// Types
export type { SQQuestion } from "./model/question";
export type { SQAnswers, SQAnswerValue } from "./model/answer";
