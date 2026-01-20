/**
 * Zod Schemas for PDF Export Data
 *
 * These schemas validate the complete payload sent from frontend to auth-server
 * for PDF generation. They import score schemas to ensure consistency.
 */

import { z } from "zod";
import {
  PHQ4ScoreSchema,
  GCPS1MScoreSchema,
  JFLS8ScoreSchema,
  JFLS20ScoreSchema,
  OBCScoreSchema,
  PainDrawingScoreSchema,
  PainDrawingImageIdSchema,
} from "./scores";

// ============================================================================
// Export Metadata Schema
// ============================================================================

export const AnamnesisExportMetadataSchema = z.object({
  /** ISO date string of when the export was generated */
  exportDate: z.string(),
  /** Patient record / case ID */
  caseId: z.string(),
  /** Organization name (optional) */
  organizationName: z.string().optional(),
});

// ============================================================================
// Patient Information Schema
// ============================================================================

export const AnamnesisExportPatientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  /** YYYY-MM-DD format */
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  /** Clinic internal patient ID */
  clinicInternalId: z.string(),
});

// ============================================================================
// SQ Export Data Schema
// ============================================================================

export const SQExportDataSchema = z.object({
  /** SQ answers */
  answers: z.record(z.unknown()),
  /** Whether the SQ screening was negative (no follow-up needed) */
  screeningNegative: z.boolean(),
  /** ISO date when the questionnaire was reviewed (optional) */
  reviewedAt: z.string().optional(),
});

// ============================================================================
// Pain Drawing Export Data Schema
// ============================================================================

export const PainDrawingExportDataSchema = z.object({
  /** Calculated pain drawing score */
  score: PainDrawingScoreSchema,
  /** Base64-encoded PNG images of pain drawing regions, keyed by region ID */
  images: z.record(PainDrawingImageIdSchema, z.string()),
});

// ============================================================================
// Questionnaires Container Schema
// ============================================================================

export const AnamnesisExportQuestionnairesSchema = z.object({
  /** DC/TMD Symptom Questionnaire */
  sq: SQExportDataSchema.optional(),
  /** PHQ-4 psychosocial screening */
  phq4: PHQ4ScoreSchema.optional(),
  /** GCPS 1-month graded chronic pain scale */
  gcps1m: GCPS1MScoreSchema.optional(),
  /** JFLS-8 jaw function limitation (short form) */
  jfls8: JFLS8ScoreSchema.optional(),
  /** JFLS-20 jaw function limitation (full form) */
  jfls20: JFLS20ScoreSchema.optional(),
  /** Oral Behaviors Checklist */
  obc: OBCScoreSchema.optional(),
});

// ============================================================================
// Complete Export Data Schema
// ============================================================================

/**
 * Complete data structure for PDF export of anamnesis questionnaires.
 *
 * This is the single source of truth for the PDF export payload.
 * The frontend collects and assembles this data, then sends it to
 * the auth-server for Typst template compilation.
 */
export const AnamnesisExportDataSchema = z.object({
  /** Export metadata */
  metadata: AnamnesisExportMetadataSchema,
  /** Patient information (decrypted) */
  patient: AnamnesisExportPatientSchema,
  /** Questionnaire scores */
  questionnaires: AnamnesisExportQuestionnairesSchema,
  /** Pain drawing data with images (optional) */
  painDrawing: PainDrawingExportDataSchema.optional(),
});
