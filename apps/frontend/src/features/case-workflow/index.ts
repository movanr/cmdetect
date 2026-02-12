/**
 * Case Workflow Feature
 *
 * Provides guided workflow infrastructure for case management.
 * Steps follow clinical pattern: Anamnesis -> Examination -> Evaluation -> Documentation -> Export
 */

// Types
export {
  type MainStep,
  type SubStep,
  type AnamnesisSubStep,
  type ExaminationSubStep,
  type DocumentationSubStep,
  type SubStepDefinition,
  type StepDefinition,
  type CaseData,
  type CaseWorkflowState,
  MAIN_STEPS,
  getStepDefinition,
  getSubStepDefinition,
  isStepComplete,
  canAccessStep,
  getFirstSubStep,
  getNextStep,
  getPreviousStep,
  getFirstIncompleteStep,
} from "./types/workflow";

// Hooks
export { useCaseProgress } from "./hooks/useCaseProgress";
export { useStepGating } from "./hooks/useStepGating";

// Components
export {
  CaseWorkflowProvider,
  useCaseId,
  useCaseIdSafe,
} from "./components/CaseWorkflowProvider";
export { SubStepTabs, SubStepTabsCompact } from "./components/SubStepTabs";
