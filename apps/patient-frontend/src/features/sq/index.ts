/**
 * DC/TMD Symptom Questionnaire (SQ) Feature
 * Public exports
 */

// Re-export from shared package
export {
  SQ_METADATA,
  SQ_SCREENS,
  SQ_SECTIONS,
  SQ_TOTAL_SCREENS,
  type SQQuestion,
  type SQAnswers,
  type SQAnswerValue,
} from "@cmdetect/questionnaires";

// Components
export { SQWizard } from "./components/SQWizard";

// Hooks
export { useSQForm } from "./hooks/useSQForm";
export { useSQWizardNavigation } from "./hooks/useSQNavigation";
export { filterEnabledAnswers } from "./hooks/evaluateEnableWhen";

// Persistence
export { saveProgress, loadProgress, clearProgress, hasProgress } from "./persistence/storage";
