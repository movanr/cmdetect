/**
 * Case Workflow Type Definitions
 *
 * Defines the step registry and type definitions for the guided case workflow.
 * Steps follow clinical pattern: Anamnesis -> Examination -> Evaluation -> Documentation
 */

import { getSectionTitle, SECTIONS, type SectionId } from "@cmdetect/dc-tmd";
import type { QuestionnaireResponse } from "../../questionnaire-viewer/hooks/useQuestionnaireResponses";

// Main workflow steps
export type MainStep = "anamnesis" | "examination" | "evaluation" | "documentation";

// Sub-step identifiers for each main step
export type AnamnesisSubStep = "review" | "wizard";
export type ExaminationSubStep = SectionId;
export type DocumentationSubStep = "report";

// Union of all sub-step types
export type SubStep = AnamnesisSubStep | ExaminationSubStep | DocumentationSubStep;

// Sub-step definition
export interface SubStepDefinition {
  id: string;
  label: string;
  order: number;
  route: string;
}

// Main step definition
export interface StepDefinition {
  id: MainStep;
  label: string;
  order: number;
  subSteps?: SubStepDefinition[];
}

// Case data used for determining step completion
export interface CaseData {
  // Patient record data
  patientRecordId: string;
  hasPatientData: boolean;

  // Questionnaire responses
  responses: QuestionnaireResponse[];

  // Anamnesis completion markers
  isScreeningNegative: boolean;
  sqReviewedAt: string | null;

  // Examination completion markers
  examinationCompletedAt: string | null;

  // Future markers
  evaluationCompletedAt: string | null;
  documentationCompletedAt: string | null;
}

// Workflow context state
export interface CaseWorkflowState {
  caseId: string;
  caseData: CaseData | null;
  isLoading: boolean;
  completedSteps: Set<MainStep>;
  currentStep: MainStep;
  currentSubStep: string | null;
}

// Step registry - single source of truth for workflow configuration
export const MAIN_STEPS: StepDefinition[] = [
  {
    id: "anamnesis",
    label: "Anamnese",
    order: 1,
    subSteps: [
      { id: "review", label: "Übersicht", order: 1, route: "review" },
      { id: "wizard", label: "SF überprüfen", order: 2, route: "wizard" },
    ],
  },
  {
    id: "examination",
    label: "Untersuchung",
    order: 2,
    subSteps: [
      { id: SECTIONS.e1, label: getSectionTitle(SECTIONS.e1), order: 1, route: SECTIONS.e1 },
      { id: SECTIONS.e2, label: getSectionTitle(SECTIONS.e2), order: 2, route: SECTIONS.e2 },
      { id: SECTIONS.e3, label: getSectionTitle(SECTIONS.e3), order: 3, route: SECTIONS.e3 },
      { id: SECTIONS.e4, label: getSectionTitle(SECTIONS.e4), order: 4, route: SECTIONS.e4 },
      { id: SECTIONS.e5, label: getSectionTitle(SECTIONS.e5), order: 5, route: SECTIONS.e5 },
      { id: SECTIONS.e6, label: getSectionTitle(SECTIONS.e6), order: 6, route: SECTIONS.e6 },
      { id: SECTIONS.e7, label: getSectionTitle(SECTIONS.e7), order: 7, route: SECTIONS.e7 },
      { id: SECTIONS.e8, label: getSectionTitle(SECTIONS.e8), order: 8, route: SECTIONS.e8 },
      { id: SECTIONS.e9, label: getSectionTitle(SECTIONS.e9), order: 9, route: SECTIONS.e9 },
      { id: SECTIONS.e10, label: getSectionTitle(SECTIONS.e10), order: 10, route: SECTIONS.e10 },
    ],
  },
  {
    id: "evaluation",
    label: "Bewertung",
    order: 3,
  },
  {
    id: "documentation",
    label: "Dokumentation",
    order: 4,
    subSteps: [
      { id: "report", label: "Befundbericht", order: 1, route: "report" },
    ],
  },
];

// Helper to get step by id
export function getStepDefinition(id: MainStep): StepDefinition | undefined {
  return MAIN_STEPS.find((s) => s.id === id);
}

// Helper to get sub-step definition
export function getSubStepDefinition(
  mainStep: MainStep,
  subStepId: string
): SubStepDefinition | undefined {
  const step = getStepDefinition(mainStep);
  return step?.subSteps?.find((s) => s.id === subStepId);
}

// Step completion logic
export function isStepComplete(step: MainStep, caseData: CaseData): boolean {
  switch (step) {
    case "anamnesis":
      // Anamnesis is complete if SQ was reviewed OR screening is negative
      return caseData.sqReviewedAt !== null || caseData.isScreeningNegative;

    case "examination":
      return caseData.examinationCompletedAt !== null;

    case "evaluation":
      return caseData.evaluationCompletedAt !== null;

    case "documentation":
      return caseData.documentationCompletedAt !== null;

    default:
      return false;
  }
}

// Step access control logic
export function canAccessStep(step: MainStep, completedSteps: Set<MainStep>): boolean {
  switch (step) {
    case "anamnesis":
      // Anamnesis is always accessible
      return true;

    case "examination":
      // Examination requires anamnesis to be complete
      return completedSteps.has("anamnesis");

    case "evaluation":
      // Evaluation requires examination to be complete
      return completedSteps.has("examination");

    case "documentation":
      // Documentation requires examination to be complete (same gate as evaluation)
      return completedSteps.has("examination");

    default:
      return false;
  }
}

// Get first accessible sub-step for a main step
export function getFirstSubStep(step: MainStep): string | undefined {
  const stepDef = getStepDefinition(step);
  return stepDef?.subSteps?.[0]?.route;
}

// Get next main step
export function getNextStep(currentStep: MainStep): MainStep | undefined {
  const currentDef = getStepDefinition(currentStep);
  if (!currentDef) return undefined;

  const nextStep = MAIN_STEPS.find((s) => s.order === currentDef.order + 1);
  return nextStep?.id;
}

// Get previous main step
export function getPreviousStep(currentStep: MainStep): MainStep | undefined {
  const currentDef = getStepDefinition(currentStep);
  if (!currentDef) return undefined;

  const prevStep = MAIN_STEPS.find((s) => s.order === currentDef.order - 1);
  return prevStep?.id;
}

// Get first incomplete step (for smart case entry redirect)
export function getFirstIncompleteStep(completedSteps: Set<MainStep>): MainStep {
  for (const step of MAIN_STEPS) {
    if (!completedSteps.has(step.id)) return step.id;
  }
  return "documentation";
}
