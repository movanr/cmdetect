/**
 * Questionnaire Viewer Feature
 *
 * Components for displaying and editing submitted questionnaire responses
 */

// Main container component for anamnesis review flow
export { AnamnesisReviewContainer } from "./components/AnamnesisReviewContainer";

// Original questionnaire viewer (can still be used directly if needed)
export { QuestionnaireViewer } from "./components/QuestionnaireViewer";

// Dashboard components
export { DashboardView } from "./components/dashboard";
export { Axis2ScoreCard } from "./components/dashboard";
export { SQStatusCard } from "./components/dashboard";
export { SQReadOnlyView } from "./components/dashboard";

// Wizard components
export { SQWizardView } from "./components/wizard";
export { SQSectionStep } from "./components/wizard";
export { WizardNavigation } from "./components/wizard";

// Question item components
export { QuestionItem } from "./components/QuestionItem";
export { InlineQuestionItem } from "./components/InlineQuestionItem";
export { OfficeUseQuestionItem } from "./components/OfficeUseQuestionItem";
export { PHQ4Summary } from "./components/PHQ4Summary";

// Hooks
export { useQuestionnaireResponses } from "./hooks/useQuestionnaireResponses";
export { useUpdateQuestionnaireResponse } from "./hooks/useUpdateQuestionnaireResponse";
export { useSQReviewForm } from "./hooks/useSQReviewForm";

// Types
export type { QuestionnaireResponse } from "./hooks/useQuestionnaireResponses";

// Utilities
export { getEnabledSections, filterEnabledAnswers } from "./utils";

// Re-export scoring utilities
export { calculatePHQ4Score, getPHQ4Interpretation } from "@cmdetect/questionnaires";
