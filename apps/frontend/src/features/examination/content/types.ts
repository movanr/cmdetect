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

import type { ProcedureFlowStep } from "@/types/procedure-flow";
export type { ProcedureFlowStep } from "@/types/procedure-flow";

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
