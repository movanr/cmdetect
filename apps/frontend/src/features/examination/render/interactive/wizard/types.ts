/**
 * Types for the E4 interactive examination wizard.
 *
 * The wizard splits the E4 section into 5 sequential steps:
 * 1. E4A - Pain-free opening measurement
 * 2. E4B - Max unassisted opening measurement
 * 3. E4B Interview - Pain interview for max unassisted
 * 4. E4C - Max assisted opening measurement
 * 5. E4C Interview - Pain interview for max assisted
 */

import type { Movement } from "../../../model/movement";
import type {
  StepInstruction,
  PainInterviewInstruction,
} from "../../../content/instructions";

/**
 * Step identifiers for the E4 wizard.
 */
export type E4StepId =
  | "e4a-measurement"
  | "e4b-measurement"
  | "e4b-interview"
  | "e4c-measurement"
  | "e4c-interview";

/**
 * Status of a wizard step.
 */
export type StepStatus = "pending" | "active" | "completed" | "skipped";

/**
 * Step type determines which content to render.
 */
export type StepType = "measurement" | "interview";

/**
 * Definition of a single wizard step.
 */
export interface E4Step {
  /** Unique step identifier */
  id: E4StepId;
  /** Full title displayed when step is active */
  title: string;
  /** Short title for collapsed bar */
  shortTitle: string;
  /** Step badge (E4A, E4B, E4C) */
  badge: string;
  /** Step type determines rendering */
  type: StepType;
  /** Movement associated with this step (for interviews and E4B/E4C measurements) */
  movement?: Movement;
  /** Field name for measurement steps */
  measurementField?: string;
  /** Field name for terminated checkbox (E4B/E4C only) */
  terminatedField?: string;
  /** Instruction to display */
  instruction: StepInstruction | PainInterviewInstruction;
}

/**
 * Runtime state of a single step.
 */
export interface E4StepState {
  /** Step definition */
  step: E4Step;
  /** Current status */
  status: StepStatus;
  /** Summary text for collapsed bar (computed from form values) */
  summary: string;
}

/**
 * Full wizard state.
 */
export interface E4WizardState {
  /** Index of currently active step */
  currentStepIndex: number;
  /** All steps with their runtime state */
  steps: E4StepState[];
}

/**
 * Actions available on the wizard.
 */
export interface E4WizardActions {
  /** Navigate to a specific step by index */
  goToStep: (index: number) => void;
  /** Advance to the next step */
  nextStep: () => void;
  /** Skip the current step without recording data */
  skipStep: () => void;
  /** Mark current step as completed and advance */
  completeCurrentStep: () => void;
}
