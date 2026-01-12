/**
 * Questionnaire Viewer Feature
 *
 * Components for displaying submitted questionnaire responses
 */

export { QuestionnaireViewer } from "./components/QuestionnaireViewer";
export { QuestionItem } from "./components/QuestionItem";
export { PHQ4Summary } from "./components/PHQ4Summary";
export { useQuestionnaireResponses } from "./hooks/useQuestionnaireResponses";
export type { QuestionnaireResponse } from "./hooks/useQuestionnaireResponses";
export { calculatePHQ4Score, getPHQ4Interpretation } from "./utils/scoring";
