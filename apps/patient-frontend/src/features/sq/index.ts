/**
 * DC/TMD Symptom Questionnaire (SQ) Feature
 * Public exports
 */

// Components
export { SQWizard } from "./components/SQWizard";

// Hooks
export { useSQForm } from "./hooks/useSQForm";
export { useSQWizardNavigation } from "./hooks/useSQNavigation";

// Persistence
export { saveProgress, loadProgress, clearProgress, hasProgress } from "./persistence/storage";

// Data
export { SQ_SCREENS, SQ_SECTIONS, SQ_TOTAL_SCREENS } from "./data/sqQuestions";

// Types
export type { SQQuestion } from "./model/question";
export type { SQAnswers, SQAnswerValue } from "./model/answer";
