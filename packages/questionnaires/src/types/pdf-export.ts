/**
 * PDF Export Data Types
 *
 * Data structures for PDF export of anamnesis questionnaires.
 * Score types are reused from the questionnaires package to ensure
 * consistency with scoring functions.
 */

import type { PHQ4Score } from "./phq4";
import type { GCPS1MScore } from "./gcps";
import type { JFLS8Score } from "./jfls8";
import type { JFLS20Score } from "./jfls20";
import type { OBCScore } from "./obc";
import type { SQAnswers } from "./sq";

/**
 * Pain drawing types for PDF export
 * Simplified from frontend types to include only what's needed for PDF generation
 */
export type PainDrawingImageId =
  | "mouth"
  | "head-right"
  | "head-left"
  | "body-front"
  | "body-back";

export type PainDrawingRiskLevel = "none" | "localized" | "regional" | "widespread";

export interface PainDrawingElementCounts {
  shadings: number;
  points: number;
  arrows: number;
  total: number;
}

export interface PainDrawingPatterns {
  hasHeadPain: boolean;
  hasOralPain: boolean;
  hasBodyPain: boolean;
  hasWidespreadPain: boolean;
}

export interface PainDrawingInterpretation {
  labelDe: string;
  descriptionDe: string;
}

export interface PainDrawingScore {
  regionCount: number; // 0-5
  affectedRegions: PainDrawingImageId[];
  elementCounts: Record<PainDrawingImageId, PainDrawingElementCounts>;
  totalElements: number;
  patterns: PainDrawingPatterns;
  riskLevel: PainDrawingRiskLevel;
  interpretation: PainDrawingInterpretation;
}

/**
 * Export metadata
 */
export interface AnamnesisExportMetadata {
  /** ISO date string of when the export was generated */
  exportDate: string;
  /** Patient record / case ID */
  caseId: string;
  /** Organization name (optional) */
  organizationName?: string;
}

/**
 * Patient information (decrypted client-side, passed to server for PDF generation)
 */
export interface AnamnesisExportPatient {
  firstName: string;
  lastName: string;
  /** YYYY-MM-DD format */
  dateOfBirth: string;
  /** Clinic internal patient ID */
  clinicInternalId: string;
}

/**
 * SQ (Symptom Questionnaire) export data
 */
export interface SQExportData {
  /** SQ answers */
  answers: SQAnswers;
  /** Whether the SQ screening was negative (no follow-up needed) */
  screeningNegative: boolean;
  /** ISO date when the questionnaire was reviewed (optional) */
  reviewedAt?: string;
}

/**
 * Pain drawing export data with scores and images
 */
export interface PainDrawingExportData {
  /** Calculated pain drawing score */
  score: PainDrawingScore;
  /** Base64-encoded PNG images of pain drawing regions, keyed by region ID */
  images: Record<PainDrawingImageId, string>;
}

/**
 * All questionnaire data for export
 */
export interface AnamnesisExportQuestionnaires {
  /** DC/TMD Symptom Questionnaire */
  sq?: SQExportData;
  /** PHQ-4 psychosocial screening */
  phq4?: PHQ4Score;
  /** GCPS 1-month graded chronic pain scale */
  gcps1m?: GCPS1MScore;
  /** JFLS-8 jaw function limitation (short form) */
  jfls8?: JFLS8Score;
  /** JFLS-20 jaw function limitation (full form) */
  jfls20?: JFLS20Score;
  /** Oral Behaviors Checklist */
  obc?: OBCScore;
}

/**
 * Complete data structure for PDF export of anamnesis questionnaires.
 *
 * This is the single source of truth for the PDF export payload.
 * The frontend collects and assembles this data, then sends it to
 * the auth-server for Typst template compilation.
 *
 * @example
 * ```typescript
 * const exportData: AnamnesisExportData = {
 *   metadata: {
 *     exportDate: new Date().toISOString(),
 *     caseId: "abc123",
 *     organizationName: "Praxis Dr. Müller"
 *   },
 *   patient: {
 *     firstName: "Max",
 *     lastName: "Mustermann",
 *     dateOfBirth: "1990-01-15",
 *     clinicInternalId: "PAT-001"
 *   },
 *   questionnaires: {
 *     phq4: calculatePHQ4Score(phq4Answers),
 *     gcps1m: calculateGCPS1MScore(gcpsAnswers),
 *     // ... other questionnaires
 *   },
 *   painDrawing: {
 *     score: calculatePainDrawingScore(painDrawingData),
 *     images: {
 *       "head-right": "data:image/png;base64,...",
 *       // ... other regions
 *     }
 *   }
 * };
 * ```
 */
export interface AnamnesisExportData {
  /** Export metadata */
  metadata: AnamnesisExportMetadata;

  /** Patient information (decrypted) */
  patient: AnamnesisExportPatient;

  /** Questionnaire scores */
  questionnaires: AnamnesisExportQuestionnaires;

  /** Pain drawing data with images (optional) */
  painDrawing?: PainDrawingExportData;
}
