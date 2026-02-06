/**
 * TypeScript interfaces for rich clinical instructions.
 *
 * These types support the DC-TMD protocol's formatting conventions:
 * - Verbatim text (must be stated exactly)
 * - Examiner-only instructions (not spoken to patient)
 */

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

/**
 * Generic procedure flow step - used for pain interviews, measurements, etc.
 * Displays as numbered steps with optional patient scripts and examiner instructions.
 *
 * Following DC-TMD protocol conventions:
 * - patientScript: Exact verbatim text to say to the patient (displayed in quotes)
 * - examinerInstruction: What the examiner does (not spoken to patient)
 * - pause: Indicates examiner should wait for patient to comply before proceeding
 * - figureRef: Reference to protocol figure(s) for this step
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
  /** Reference to DC-TMD protocol figure(s) - e.g., "11" or ["13", "14"] */
  figureRef?: string | string[];
  /** Optional hint about app interaction for this step */
  appAction?: string;
  /** Condition under which this step applies (e.g., "Falls nicht nur unter dem Finger") */
  condition?: string;
}

/** Pain interview instruction with flow */
export interface RichPainInterviewInstruction {
  title: string;
  prompt: string;
  flow: ProcedureFlowStep[];
  /** Protocol references - flat list of cross-references to protocol sections */
  protocolRefs?: CrossReference[];
}

/** Measurement instruction with step-based flow */
export interface RichMeasurementInstruction {
  stepId: string;
  title: string;
  /** Step-by-step procedure flow */
  flow: ProcedureFlowStep[];
  /** Safety warnings */
  warnings?: SafetyWarning[];
  /** Protocol references - flat list of cross-references to protocol sections */
  protocolRefs?: CrossReference[];
}
