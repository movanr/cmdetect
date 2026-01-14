/**
 * Questionnaire Engine
 * Generic components and utilities for rendering questionnaires
 */

// Types
export type {
  GenericQuestion,
  GenericQuestionnaire,
  NavigationState,
  QuestionnaireFlowItem,
  QuestionnaireProgress,
  QuestionType,
} from "./types";

// Config
export {
  getFlowIds,
  getFlowItemById,
  getNextFlowItem,
  QUESTIONNAIRE_FLOW,
  TOTAL_QUESTIONNAIRES,
} from "./config/flowConfig";

// Hooks
export { useLinearNavigation } from "./hooks/useLinearNavigation";
export { useQuestionnaireForm } from "./hooks/useQuestionnaireForm";

// Components
export { GenericWizard } from "./components/GenericWizard";
export { ProgressHeader, type TransitionPhase } from "./components/ProgressHeader";
export { QuestionnaireComplete } from "./components/QuestionnaireComplete";
export { ChoiceQuestion } from "./components/questions/ChoiceQuestion";
export { NumericQuestion } from "./components/questions/NumericQuestion";
export { QuestionRenderer } from "./components/questions/QuestionRenderer";
export { ScaleQuestion } from "./components/questions/ScaleQuestion";
