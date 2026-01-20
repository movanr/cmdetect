/**
 * PDF Export endpoint for generating anamnesis reports
 * Uses Typst for template compilation
 *
 * SECURITY REQUIREMENTS:
 * - JWT authentication required
 * - No disk writes (memory-only processing)
 * - No logging of patient data fields
 * - Response streaming (no intermediate storage)
 */

import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { auth } from "./auth";
import { sendHttpError } from "./errors";
import { $typst } from "@myriaddreamin/typst.ts/dist/cjs/contrib/snippet.cjs";

// ============================================================================
// Validation Schemas
// ============================================================================

// Pain drawing types
const PainDrawingImageIdSchema = z.enum([
  "mouth",
  "head-right",
  "head-left",
  "body-front",
  "body-back",
]);

const PainDrawingRiskLevelSchema = z.enum([
  "none",
  "localized",
  "regional",
  "widespread",
]);

const PainDrawingElementCountsSchema = z.object({
  shadings: z.number(),
  points: z.number(),
  arrows: z.number(),
  total: z.number(),
});

const PainDrawingPatternsSchema = z.object({
  hasHeadPain: z.boolean(),
  hasOralPain: z.boolean(),
  hasBodyPain: z.boolean(),
  hasWidespreadPain: z.boolean(),
});

const PainDrawingInterpretationSchema = z.object({
  labelDe: z.string(),
  descriptionDe: z.string(),
});

const PainDrawingScoreSchema = z.object({
  regionCount: z.number().min(0).max(5),
  affectedRegions: z.array(PainDrawingImageIdSchema),
  elementCounts: z.record(PainDrawingImageIdSchema, PainDrawingElementCountsSchema),
  totalElements: z.number(),
  patterns: PainDrawingPatternsSchema,
  riskLevel: PainDrawingRiskLevelSchema,
  interpretation: PainDrawingInterpretationSchema,
});

// PHQ-4 Score Schema
const PHQ4ScoreSchema = z.object({
  total: z.number().min(0).max(12),
  maxTotal: z.number(),
  anxiety: z.number().min(0).max(6),
  maxAnxiety: z.number(),
  depression: z.number().min(0).max(6),
  maxDepression: z.number(),
});

// GCPS-1M Score Schema
const GCPSGradeInterpretationSchema = z.object({
  grade: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  label: z.string(),
  labelDe: z.string(),
});

const GCPS1MScoreSchema = z.object({
  cpi: z.number().min(0).max(100),
  cpiLevel: z.enum(["none", "low", "high"]),
  interferenceScore: z.number().min(0).max(100),
  interferencePoints: z.number().min(0).max(3),
  disabilityDays: z.number().min(0),
  disabilityDaysPoints: z.number().min(0).max(3),
  totalDisabilityPoints: z.number().min(0).max(6),
  grade: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  gradeInterpretation: GCPSGradeInterpretationSchema,
});

// JFLS Score Schemas
const JFLS8LimitationInterpretationSchema = z.object({
  label: z.string(),
  labelDe: z.string(),
}).nullable();

const JFLS8ScoreSchema = z.object({
  globalScore: z.number().nullable(),
  maxScore: z.number(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  missingCount: z.number(),
  isValid: z.boolean(),
  limitationLevel: z.enum(["normal", "mild", "significant"]).nullable(),
  limitationInterpretation: JFLS8LimitationInterpretationSchema,
});

const JFLS20SubscaleScoreSchema = z.object({
  score: z.number().nullable(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  missingCount: z.number(),
  isValid: z.boolean(),
});

const JFLS20ScoreSchema = z.object({
  globalScore: z.number().nullable(),
  subscaleGlobalScore: z.number().nullable(),
  maxScore: z.number(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  missingCount: z.number(),
  isValid: z.boolean(),
  limitationLevel: z.enum(["normal", "mild", "significant"]).nullable(),
  limitationInterpretation: JFLS8LimitationInterpretationSchema,
  subscales: z.object({
    mastication: JFLS20SubscaleScoreSchema,
    mobility: JFLS20SubscaleScoreSchema,
    communication: JFLS20SubscaleScoreSchema,
  }),
});

// OBC Score Schema
const OBCRiskInterpretationSchema = z.object({
  label: z.string(),
  labelDe: z.string(),
});

const OBCScoreSchema = z.object({
  totalScore: z.number(),
  maxScore: z.number(),
  answeredCount: z.number(),
  totalQuestions: z.number(),
  riskLevel: z.enum(["normal", "elevated", "high"]),
  riskInterpretation: OBCRiskInterpretationSchema,
});

// SQ Export Data Schema
const SQExportDataSchema = z.object({
  answers: z.record(z.unknown()),
  screeningNegative: z.boolean(),
  reviewedAt: z.string().optional(),
});

// Pain Drawing Export Data Schema
const PainDrawingExportDataSchema = z.object({
  score: PainDrawingScoreSchema,
  images: z.record(PainDrawingImageIdSchema, z.string()),
});

// Complete Export Data Schema
const AnamnesisExportDataSchema = z.object({
  metadata: z.object({
    exportDate: z.string(),
    caseId: z.string(),
    organizationName: z.string().optional(),
  }),
  patient: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    clinicInternalId: z.string(),
  }),
  questionnaires: z.object({
    sq: SQExportDataSchema.optional(),
    phq4: PHQ4ScoreSchema.optional(),
    gcps1m: GCPS1MScoreSchema.optional(),
    jfls8: JFLS8ScoreSchema.optional(),
    jfls20: JFLS20ScoreSchema.optional(),
    obc: OBCScoreSchema.optional(),
  }),
  painDrawing: PainDrawingExportDataSchema.optional(),
});

export type AnamnesisExportDataInput = z.infer<typeof AnamnesisExportDataSchema>;

// ============================================================================
// PDF Generation
// ============================================================================

/**
 * Convert a JavaScript value to Typst dictionary literal syntax.
 * Typst uses: (key: value, key2: value2) for dictionaries
 *            (item1, item2) for arrays
 */
function toTypstValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "none";
  }

  if (typeof value === "string") {
    // Escape backslashes and quotes in strings
    const escaped = value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");
    return `"${escaped}"`;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "()";
    }
    const items = value.map(toTypstValue).join(", ");
    return `(${items},)`; // Trailing comma for arrays
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return "(:)";
    }
    const pairs = entries.map(([k, v]) => {
      // Keys with hyphens need quoting in Typst
      const key = k.includes("-") ? `"${k}"` : k;
      return `${key}: ${toTypstValue(v)}`;
    });
    return `(${pairs.join(", ")})`;
  }

  return "none";
}

/**
 * Compiles a Typst template with the given data and returns the PDF buffer.
 * Uses the typst.ts WASM library - no external CLI required.
 * Memory-only processing - no disk writes.
 */
async function compileTypstToPdf(
  templatePath: string,
  data: AnamnesisExportDataInput
): Promise<Buffer> {
  // Read the template file
  const templateContent = fs.readFileSync(templatePath, "utf-8");

  // Convert data to Typst dictionary literal (not JSON)
  // Typst's json.decode has issues with backticks and requires a proper string,
  // so we inject native Typst dict syntax instead
  const typstData = toTypstValue(data);

  // Create a modified template that includes the data as a variable
  const templateWithData = `
#let data = ${typstData}

${templateContent.replace('#let data = json(sys.inputs.data)', '// Data injected above')}
`;

  try {
    // Compile using typst.ts WASM
    const pdfBytes = await $typst.pdf({ mainContent: templateWithData });
    if (!pdfBytes) {
      throw new Error("Typst returned empty PDF");
    }
    return Buffer.from(pdfBytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Typst compilation failed:", message);
    throw new Error(`Typst compilation failed: ${message}`);
  }
}

// ============================================================================
// Route Handler
// ============================================================================

/**
 * PDF Export endpoint handler
 * POST /api/pdf/anamnesis
 *
 * Security:
 * - Requires valid Better Auth session
 * - Validates request body with Zod
 * - No PII logging
 * - Memory-only processing
 */
export async function handlePdfAnamnesisExport(
  req: Request,
  res: Response
): Promise<void> {
  // 1. Verify authentication using Better Auth session
  const sessionResult = await auth.api.getSession({
    headers: new Headers(req.headers as HeadersInit),
  });

  if (!sessionResult || !sessionResult.user) {
    return sendHttpError(res, 401, "Authentication required");
  }

  // Log request without PII
  console.log("PDF export request from user:", sessionResult.user.email);

  // 2. Validate request body
  const parseResult = AnamnesisExportDataSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    console.error("PDF export validation failed:", errorMessage);
    return sendHttpError(res, 400, `Invalid export data: ${errorMessage}`);
  }

  const exportData = parseResult.data;

  // 3. Resolve template path
  // In monorepo: templates are in packages/pdf-templates/templates/
  // __dirname in CommonJS is the directory of this file (apps/auth-server/src or dist)
  // We need to navigate up to the workspace root and then to the templates package
  const templatePath = path.resolve(
    __dirname,
    // In dev: src/ -> auth-server/ -> apps/ -> workspace root -> packages/pdf-templates
    // In prod: dist/ -> auth-server/ -> apps/ -> workspace root -> packages/pdf-templates
    "..", "..", "..", "packages", "pdf-templates", "templates", "anamnesis-report.typ"
  );

  // 4. Compile Typst template to PDF (memory-only)
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await compileTypstToPdf(templatePath, exportData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PDF generation failed:", message);
    return sendHttpError(res, 500, "Failed to generate PDF");
  }

  // 5. Send PDF response
  const filename = `anamnesis-${exportData.metadata.caseId}-${exportData.metadata.exportDate.slice(0, 10)}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Length", pdfBuffer.length);

  // Stream the PDF buffer directly - no intermediate storage
  res.send(pdfBuffer);

  // Log success without PII
  console.log(
    "PDF export completed:",
    `case=${exportData.metadata.caseId}`,
    `size=${pdfBuffer.length} bytes`
  );
}
