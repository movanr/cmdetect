/**
 * Questionnaire Engine
 * Generic components and utilities for rendering questionnaires
 */

// Types
export type {
  QuestionType,
  GenericQuestion,
  GenericQuestionnaire,
  QuestionnaireFlowItem,
  NavigationState,
  QuestionnaireProgress,
} from "./types";

// Config
export {
  QUESTIONNAIRE_FLOW,
  getFlowItemById,
  getNextFlowItem,
  getFlowIds,
  TOTAL_QUESTIONNAIRES,
} from "./config/flowConfig";

// Hooks
export { useQuestionnaireForm } from "./hooks/useQuestionnaireForm";
export { useLinearNavigation } from "./hooks/useLinearNavigation";

// Persistence
export { saveProgress, loadProgress, clearProgress } from "./persistence/storage";

// Components
export { GenericWizard } from "./components/GenericWizard";
export { QuestionnaireComplete } from "./components/QuestionnaireComplete";
export { ProgressHeader } from "./components/ProgressHeader";
export { QuestionRenderer } from "./components/questions/QuestionRenderer";
export { ScaleQuestion } from "./components/questions/ScaleQuestion";
export { ChoiceQuestion } from "./components/questions/ChoiceQuestion";
export { NumericQuestion } from "./components/questions/NumericQuestion";
