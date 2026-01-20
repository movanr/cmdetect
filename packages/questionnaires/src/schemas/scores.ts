/**
 * Zod Schemas for Questionnaire Scores
 *
 * This is the single source of truth for all score validation.
 * TypeScript types are derived from these schemas using z.infer<>.
 *
 * All labels are German-only (no separate labelDe field).
 */

import { z } from "zod";

// ============================================================================
// GCPS (Graded Chronic Pain Scale) Schemas
// ============================================================================

export const GCPSGradeSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const GCPSCPILevelSchema = z.enum(["none", "low", "high"]);

export const GCPSGradeInterpretationSchema = z.object({
  grade: GCPSGradeSchema,
  label: z.string(), // German only
});

export const GCPS1MScoreSchema = z.object({
  /** Characteristic Pain Intensity (mean of items 2-4 × 10), range 0-100 */
  cpi: z.number().min(0).max(100),
  /** CPI level interpretation */
  cpiLevel: GCPSCPILevelSchema,
  /** Interference Score (mean of items 6-8 × 10), range 0-100 */
  interferenceScore: z.number().min(0).max(100),
  /** Interference points derived from score (0-3) */
  interferencePoints: z.number().min(0).max(3),
  /** Disability days from item 5 */
  disabilityDays: z.number().min(0),
  /** Disability days points (0-3) */
  disabilityDaysPoints: z.number().min(0).max(3),
  /** Total disability points (interference + days), range 0-6 */
  totalDisabilityPoints: z.number().min(0).max(6),
  /** Final Chronic Pain Grade (0-IV) */
  grade: GCPSGradeSchema,
  /** Grade interpretation */
  gradeInterpretation: GCPSGradeInterpretationSchema,
});

// ============================================================================
// PHQ-4 (Patient Health Questionnaire-4) Schemas
// ============================================================================

export const PHQ4SeveritySchema = z.enum(["none", "mild", "moderate", "severe"]);

export const PHQ4ScoreSchema = z.object({
  /** Total score (0-12) */
  total: z.number().min(0).max(12),
  /** Maximum possible total */
  maxTotal: z.number(),
  /** GAD-2 subscale score (PHQ4_C + PHQ4_D, 0-6) */
  anxiety: z.number().min(0).max(6),
  /** Maximum anxiety subscale */
  maxAnxiety: z.number(),
  /** PHQ-2 subscale score (PHQ4_A + PHQ4_B, 0-6) */
  depression: z.number().min(0).max(6),
  /** Maximum depression subscale */
  maxDepression: z.number(),
});

export const PHQ4InterpretationSchema = z.object({
  severity: PHQ4SeveritySchema,
  label: z.string(), // German only
});

export const PHQ4SubscaleResultSchema = z.object({
  /** Whether the subscale is positive (score >= 3) */
  positive: z.boolean(),
  /** German text describing the result */
  label: z.string(), // German only
});

// ============================================================================
// JFLS-8 (Jaw Functional Limitation Scale - 8 items) Schemas
// ============================================================================

export const JFLS8LimitationLevelSchema = z.enum(["normal", "mild", "significant"]);

export const JFLS8LimitationInterpretationSchema = z.object({
  label: z.string(), // German only
});

export const JFLS8ScoreSchema = z.object({
  globalScore: z.number().nullable(),
  maxScore: z.number(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  missingCount: z.number(),
  isValid: z.boolean(),
  limitationLevel: JFLS8LimitationLevelSchema.nullable(),
  limitationInterpretation: JFLS8LimitationInterpretationSchema.nullable(),
});

// ============================================================================
// JFLS-20 (Jaw Functional Limitation Scale - 20 items) Schemas
// ============================================================================

export const JFLS20LimitationLevelSchema = z.enum(["normal", "mild", "significant"]);

export const JFLS20LimitationInterpretationSchema = z.object({
  label: z.string(), // German only
});

export const JFLS20SubscaleScoreSchema = z.object({
  score: z.number().nullable(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  missingCount: z.number(),
  isValid: z.boolean(),
  limitationLevel: JFLS20LimitationLevelSchema.nullable(),
  limitationInterpretation: JFLS20LimitationInterpretationSchema.nullable(),
});

export const JFLS20ScoreSchema = z.object({
  /** Global score: mean of all items (max 2 missing allowed) */
  globalScore: z.number().nullable(),
  /** Alternative global: mean of 3 subscale scores (all must be valid) */
  subscaleGlobalScore: z.number().nullable(),
  maxScore: z.number(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  missingCount: z.number(),
  isValid: z.boolean(),
  limitationLevel: JFLS20LimitationLevelSchema.nullable(),
  limitationInterpretation: JFLS20LimitationInterpretationSchema.nullable(),
  subscales: z.object({
    mastication: JFLS20SubscaleScoreSchema,
    mobility: JFLS20SubscaleScoreSchema,
    communication: JFLS20SubscaleScoreSchema,
  }),
});

// ============================================================================
// OBC (Oral Behaviors Checklist) Schemas
// ============================================================================

export const OBCRiskLevelSchema = z.enum(["normal", "elevated", "high"]);

export const OBCRiskInterpretationSchema = z.object({
  label: z.string(), // German only
});

export const OBCScoreSchema = z.object({
  totalScore: z.number(),
  maxScore: z.number(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  riskLevel: OBCRiskLevelSchema,
  riskInterpretation: OBCRiskInterpretationSchema,
});

// ============================================================================
// Pain Drawing Schemas
// ============================================================================

export const PainDrawingImageIdSchema = z.enum([
  "mouth",
  "head-right",
  "head-left",
  "body-front",
  "body-back",
]);

export const PainDrawingRiskLevelSchema = z.enum([
  "none",
  "localized",
  "regional",
  "widespread",
]);

export const PainDrawingElementCountsSchema = z.object({
  shadings: z.number(),
  points: z.number(),
  arrows: z.number(),
  total: z.number(),
});

export const PainDrawingPatternsSchema = z.object({
  hasHeadPain: z.boolean(),
  hasOralPain: z.boolean(),
  hasBodyPain: z.boolean(),
  hasWidespreadPain: z.boolean(),
});

export const PainDrawingInterpretationSchema = z.object({
  label: z.string(), // German only
  description: z.string(), // German only
});

export const PainDrawingScoreSchema = z.object({
  regionCount: z.number().min(0).max(5),
  affectedRegions: z.array(PainDrawingImageIdSchema),
  elementCounts: z.record(PainDrawingImageIdSchema, PainDrawingElementCountsSchema),
  totalElements: z.number(),
  patterns: PainDrawingPatternsSchema,
  riskLevel: PainDrawingRiskLevelSchema,
  interpretation: PainDrawingInterpretationSchema,
});
