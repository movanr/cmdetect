/**
 * DC/TMD Clinical Findings Categorization Types
 *
 * Categorizes DC/TMD data into three categories:
 * - Symptom: SQ questionnaire finding + clinical examination confirmation
 * - History: SQ questionnaire finding only (no exam confirmation)
 * - Sign: Examination-only finding (no SQ counterpart)
 *
 * Reference: DC/TMD Symptoms vs History Categorization (Axis I + Axis II)
 */

import type { Region, Side } from "../ids/anatomy";
import type { DiagnosisId } from "../ids/diagnosis";
import type { SectionId } from "../ids/examination";

// ============================================================================
// FINDING CATEGORIES
// ============================================================================

export type FindingCategory = "symptom" | "history" | "sign";

// ============================================================================
// SYMPTOM DOMAINS
// ============================================================================

/**
 * Symptom domains — each represents a distinct SQ + E confirmed finding.
 *
 * Pain-related:
 * - painLocation: SQ1+SQ3 confirmed by E1a pain in region/side
 * - familiarPainPalpation: SQ1+SQ3+SQ4 confirmed by E9 familiar pain
 * - familiarPainOpening: SQ1+SQ3+SQ4 confirmed by E4 familiar pain
 * - familiarPainMovement: SQ1+SQ3+SQ4 confirmed by E5 familiar pain
 *
 * Headache-related:
 * - headacheLocation: SQ5 confirmed by E1b headache in temporalis
 * - familiarHeadachePalpation: SQ5+SQ7 confirmed by E9 familiar headache
 * - familiarHeadacheOpening: SQ5+SQ7 confirmed by E4 familiar headache
 * - familiarHeadacheMovement: SQ5+SQ7 confirmed by E5 familiar headache
 *
 * Joint sounds:
 * - tmjClick: SQ8 confirmed by E6/E7 examiner click
 * - tmjCrepitus: SQ8 confirmed by E6/E7 examiner crepitus
 *
 * Joint disorders:
 * - closedLocking: SQ9+SQ10 confirmed by E8 closed locking
 * - limitedOpening: SQ10 confirmed by E4+E2 < 40mm
 * - intermittentLocking: SQ11+SQ12=no confirmed by E6/E7 click pattern
 * - subluxation: SQ13+SQ14 (+ optional E8 open locking)
 */
export type SymptomDomain =
  | "painLocation"
  | "familiarPainPalpation"
  | "familiarPainOpening"
  | "familiarPainMovement"
  | "headacheLocation"
  | "familiarHeadachePalpation"
  | "familiarHeadacheOpening"
  | "familiarHeadacheMovement"
  | "tmjClick"
  | "tmjCrepitus"
  | "closedLocking"
  | "limitedOpening"
  | "intermittentLocking"
  | "subluxation";

// ============================================================================
// HISTORY TYPES
// ============================================================================

/**
 * History types — why a finding is categorized as history.
 *
 * - temporal: Onset/duration descriptor (SQ2, SQ6)
 * - frequency: Frequency descriptor (SQ3 value)
 * - functionalModification: Individual SQ4/SQ7 items (which activity modifies pain)
 * - unconfirmed: SQ positive but examination did not confirm
 */
export type HistoryType =
  | "temporal"
  | "frequency"
  | "functionalModification"
  | "unconfirmed";

// ============================================================================
// FINDING INTERFACES
// ============================================================================

/**
 * A confirmed symptom: SQ questionnaire report + examination confirmation.
 */
export interface SymptomFinding {
  category: "symptom";
  /** What type of clinical finding */
  domain: SymptomDomain;
  /** German label for display */
  label: string;
  /** Body side where confirmed */
  side: Side;
  /** Anatomical region (if region-specific) */
  region?: Region;
  /** SQ question IDs that contribute to the anamnesis */
  sqSources: string[];
  /** Brief description of what examination confirmed it */
  examConfirmation: string;
  /** Diagnosis IDs this symptom contributes to */
  relatedDiagnoses: DiagnosisId[];
}

/**
 * A history finding: questionnaire report without examination confirmation.
 */
export interface HistoryFinding {
  category: "history";
  /** SQ question ID (e.g., "SQ2", "SQ4_A") */
  field: string;
  /** German label for display */
  label: string;
  /** Current value from questionnaire */
  value: unknown;
  /** Why this is history rather than a symptom */
  historyType: HistoryType;
}

/**
 * A clinical sign: examination-only finding without SQ counterpart.
 */
export interface SignFinding {
  category: "sign";
  /** Examination section (e.g., "e2", "e3") */
  section: SectionId;
  /** Dot-separated field path within the section */
  field: string;
  /** German label for display */
  label: string;
  /** Measured/observed value */
  value: unknown;
  /** Body side (if side-specific) */
  side?: Side;
  /** Anatomical region (if region-specific) */
  region?: Region;
}

/** Any categorized finding */
export type CategorizedFinding = SymptomFinding | HistoryFinding | SignFinding;

// ============================================================================
// AGGREGATED RESULT
// ============================================================================

/**
 * Complete clinical findings organized by category.
 *
 * Intended for clinical summary display, PDF reports,
 * and the evaluation view.
 */
export interface ClinicalFindings {
  /** Confirmed findings (SQ + E) */
  symptoms: SymptomFinding[];
  /** Questionnaire-only findings */
  history: HistoryFinding[];
  /** Examination-only findings */
  signs: SignFinding[];
}
