/**
 * TypeScript interfaces for rich clinical instructions.
 *
 * These types support the DC-TMD protocol's formatting conventions:
 * - Verbatim text (must be stated exactly)
 * - Flexible text (intent matters, wording can vary)
 * - Optional text (may be included based on context)
 * - Examiner-only instructions (not spoken to patient)
 */

/** Text formatting following DC/TMD protocol conventions */
export type TextStyle =
  | "verbatim" // Bold - must be stated exactly
  | "flexible" // Normal - intent matters
  | "optional" // [optional text]
  | "examiner-only"; // <instruction to examiner>

/** A segment of instructional text with styling */
export interface TextSegment {
  text: string;
  style: TextStyle;
}

/** Patient script - simple string or array of styled segments */
export type PatientScript = string | TextSegment[];

/** Safety warning levels */
export type WarningLevel = "caution" | "critical";

/** Safety warning */
export interface SafetyWarning {
  message: string;
  level: WarningLevel;
}

/** Cross-reference to protocol section */
export interface CrossReference {
  section: string; // e.g., "6.2.1"
  label: string;
}

/** A phase in a multi-step procedure */
export interface ProcedurePhase {
  id: string;
  name: string;
  patientScript?: PatientScript;
  examinerSteps: string[];
  tips?: string[];
}

/** Extended instruction for examination steps */
export interface RichStepInstruction {
  stepId: string;
  title: string;
  patientScript: PatientScript;
  examinerAction: string;
  examinerSteps?: string[]; // Detailed steps (expandable)
  phases?: ProcedurePhase[]; // Multi-phase procedures
  warnings?: SafetyWarning[]; // Safety warnings
  crossReferences?: CrossReference[];
  tips?: string[];
}

/** Pain interview flow step */
export interface PainInterviewFlowStep {
  id: string;
  /** Short label for the step (e.g., "Schmerz?") */
  question: string;
  /** Full German text for the examiner to say/ask */
  description?: string;
  /** Optional hint about app interaction for this step */
  appAction?: string;
}

/** Pain interview instruction with flow */
export interface RichPainInterviewInstruction {
  title: string;
  prompt: string;
  flow: PainInterviewFlowStep[];
}

/**
 * Type guard to check if a PatientScript is an array of TextSegments
 */
export function isSegmentedScript(script: PatientScript): script is TextSegment[] {
  return Array.isArray(script);
}

/**
 * Type guard to check if an instruction has phases (multi-phase procedure)
 */
export function hasPhases(
  instruction: RichStepInstruction
): instruction is RichStepInstruction & { phases: ProcedurePhase[] } {
  return instruction.phases != null && instruction.phases.length > 0;
}
