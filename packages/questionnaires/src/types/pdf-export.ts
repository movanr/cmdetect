/**
 * PDF Export Data Types
 *
 * Data structures for PDF export of anamnesis questionnaires.
 * All types are derived from Zod schemas for single source of truth.
 * All labels are German-only (no separate labelDe field).
 */

import { z } from "zod";
import {
  PainDrawingImageIdSchema,
  PainDrawingRiskLevelSchema,
  PainDrawingElementCountsSchema,
  PainDrawingPatternsSchema,
  PainDrawingInterpretationSchema,
  PainDrawingScoreSchema,
} from "../schemas/scores";
import {
  AnamnesisExportMetadataSchema,
  AnamnesisExportPatientSchema,
  SQExportDataSchema,
  PainDrawingExportDataSchema,
  AnamnesisExportQuestionnairesSchema,
  AnamnesisExportDataSchema,
} from "../schemas/pdf-export";

/**
 * Pain drawing types for PDF export
 * Derived from Zod schemas for single source of truth.
 */
export type PainDrawingImageId = z.infer<typeof PainDrawingImageIdSchema>;
export type PainDrawingRiskLevel = z.infer<typeof PainDrawingRiskLevelSchema>;
export type PainDrawingElementCounts = z.infer<typeof PainDrawingElementCountsSchema>;
export type PainDrawingPatterns = z.infer<typeof PainDrawingPatternsSchema>;
export type PainDrawingInterpretation = z.infer<typeof PainDrawingInterpretationSchema>;
export type PainDrawingScore = z.infer<typeof PainDrawingScoreSchema>;

/**
 * Export metadata
 * Derived from Zod schema for single source of truth.
 */
export type AnamnesisExportMetadata = z.infer<typeof AnamnesisExportMetadataSchema>;

/**
 * Patient information (decrypted client-side, passed to server for PDF generation)
 * Derived from Zod schema for single source of truth.
 */
export type AnamnesisExportPatient = z.infer<typeof AnamnesisExportPatientSchema>;

/**
 * SQ (Symptom Questionnaire) export data
 * Derived from Zod schema for single source of truth.
 */
export type SQExportData = z.infer<typeof SQExportDataSchema>;

/**
 * Pain drawing export data with scores and images
 * Derived from Zod schema for single source of truth.
 */
export type PainDrawingExportData = z.infer<typeof PainDrawingExportDataSchema>;

/**
 * All questionnaire data for export
 * Derived from Zod schema for single source of truth.
 */
export type AnamnesisExportQuestionnaires = z.infer<typeof AnamnesisExportQuestionnairesSchema>;

/**
 * Complete data structure for PDF export of anamnesis questionnaires.
 *
 * This is the single source of truth for the PDF export payload.
 * The frontend collects and assembles this data, then sends it to
 * the auth-server for Typst template compilation.
 *
 * Derived from Zod schema for single source of truth.
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
export type AnamnesisExportData = z.infer<typeof AnamnesisExportDataSchema>;
