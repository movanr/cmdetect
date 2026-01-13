/**
 * JFLS-8 Questionnaire Feature
 */

// Re-export from shared package
export {
  JFLS8_METADATA,
  JFLS8_QUESTIONNAIRE,
  type JFLS8Answers,
} from "@cmdetect/questionnaires";

// Components
export { JFLS8Wizard } from "./components/JFLS8Wizard";

// Hooks
export { useJFLS8Form } from "./hooks/useJFLS8Form";

// Persistence
export { loadProgress, clearProgress } from "./persistence/storage";
