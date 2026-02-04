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
  section: string; // Route parameter (e.g., "e4", "section6")
  anchor?: string; // Optional anchor ID (e.g., "4a-schmerzfreie-offnung")
  label: string; // Display text
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
  /** Optional hint about app interaction for this step */
  appAction?: string;
}

/**
 * Generic procedure flow step - used for pain interviews, measurements, etc.
 * Displays as numbered steps with optional patient scripts and examiner instructions.
 *
 * Following DC-TMD protocol conventions:
 * - patientScript: Exact verbatim text to say to the patient (displayed in quotes)
 * - examinerInstruction: What the examiner does (not spoken to patient)
 * - pause: Indicates examiner should wait for patient to comply before proceeding
 */
export interface ProcedureFlowStep {
  id: string;
  /** Short label for the step (e.g., "Anweisung", "Messen") */
  label: string;
  /** Verbatim patient script - exact words to say (displayed with quotation marks) */
  patientScript?: string;
  /** Examiner instruction - what to do (not spoken to patient, no quotes) */
  examinerInstruction?: string;
  /** Pause indicator - wait for patient to comply before proceeding */
  pause?: boolean;
  /** Optional hint about app interaction for this step */
  appAction?: string;
}

/** @deprecated Use ProcedureFlowStep instead */
export type PainInterviewFlowStep = ProcedureFlowStep;

/** Pain interview instruction with flow */
export interface RichPainInterviewInstruction {
  title: string;
  prompt: string;
  flow: ProcedureFlowStep[];
  /** Concise specification - section 4 quick reference table */
  conciseSpec?: CrossReference[];
  /** Complete specification - section 5 detailed protocol */
  completeSpec?: CrossReference[];
  /** Additional information - general instructions (section 2, 6, etc.) */
  additionalInfo?: CrossReference[];
}

/** Measurement instruction with step-based flow */
export interface RichMeasurementInstruction {
  stepId: string;
  title: string;
  /** Step-by-step procedure flow */
  flow: ProcedureFlowStep[];
  /** Safety warnings */
  warnings?: SafetyWarning[];
  /** Concise specification - section 4 quick reference table */
  conciseSpec?: CrossReference[];
  /** Complete specification - section 5 detailed protocol */
  completeSpec?: CrossReference[];
  /** Additional information - general instructions (section 2, 6, etc.) */
  additionalInfo?: CrossReference[];
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
