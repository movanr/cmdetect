/**
 * Type definitions for the generic questionnaire engine
 */

import type {
  GenericQuestion,
  GenericQuestionnaire,
  GenericSection,
  QuestionType,
} from "@cmdetect/questionnaires";

// Re-export from package for convenience
export type { GenericQuestion, GenericQuestionnaire, GenericSection, QuestionType };

/**
 * Flow item configuration
 */
export type QuestionnaireFlowItem = {
  questionnaire: GenericQuestionnaire;
  isCustom?: boolean;
};

/**
 * Navigation state returned by useLinearNavigation
 */
export type NavigationState<Q = GenericQuestion> = {
  currentQuestion: Q;
  currentIndex: number;
  totalQuestions: number;
  canGoBack: boolean;
  isComplete: boolean;
  goNext: () => void;
  goBack: () => void;
};

/**
 * Progress data for persistence
 */
export type QuestionnaireProgress<T = Record<string, unknown>> = {
  token: string;
  answers: T;
  currentIndex: number;
  timestamp: number;
};
