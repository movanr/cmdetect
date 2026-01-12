/**
 * PHQ-4 Questionnaire Feature
 */

// Re-export from shared package
export {
  PHQ4_METADATA,
  PHQ4_QUESTIONNAIRE,
  type PHQ4Answers,
} from "@cmdetect/questionnaires";

// Components
export { PHQ4Wizard } from "./components/PHQ4Wizard";

// Hooks
export { usePHQ4Form } from "./hooks/usePHQ4Form";

// Persistence
export { loadProgress, clearProgress } from "./persistence/storage";
