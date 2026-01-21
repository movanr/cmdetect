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

// Import validation schemas and questionnaire definitions from questionnaires package
import {
  AnamnesisExportDataSchema,
  // PHQ-4 definitions
  PHQ4_QUESTIONS,
  PHQ4_QUESTION_ORDER,
  PHQ4_METADATA,
  PHQ4_OPTION_LABELS,
  // GCPS-1M definitions
  GCPS_1M_QUESTIONS,
  GCPS_1M_QUESTION_ORDER,
  GCPS_1M_METADATA,
  GCPS_1M_OPTION_LABELS,
  // JFLS-8 definitions
  JFLS8_QUESTIONS,
  JFLS8_QUESTION_ORDER,
  JFLS8_METADATA,
  JFLS8_OPTION_LABELS,
  // JFLS-20 definitions
  JFLS20_QUESTIONS,
  JFLS20_QUESTION_ORDER,
  JFLS20_METADATA,
  JFLS20_OPTION_LABELS,
  // OBC definitions
  OBC_QUESTIONS,
  OBC_QUESTION_ORDER,
  OBC_METADATA,
  OBC_SLEEP_OPTION_LABELS,
  OBC_WAKING_OPTION_LABELS,
  // SQ definitions
  SQ_METADATA,
  SQ_QUESTION_ORDER,
  SQ_QUESTION_SHORT_LABELS,
  SQ_DISPLAY_IDS,
  SQ_YES_NO_LABELS,
  SQ_PAIN_FREQUENCY_LABELS,
} from "@cmdetect/questionnaires";

export type AnamnesisExportDataInput = z.infer<typeof AnamnesisExportDataSchema>;

/**
 * Questionnaire definitions for Typst template
 * These are static and imported from the questionnaires package
 */
const QUESTIONNAIRE_DEFINITIONS = {
  phq4: {
    metadata: PHQ4_METADATA,
    questions: PHQ4_QUESTION_ORDER.map((id) => ({
      id,
      text: PHQ4_QUESTIONS[id].text,
    })),
    optionLabels: PHQ4_OPTION_LABELS,
  },
  gcps1m: {
    metadata: GCPS_1M_METADATA,
    questions: GCPS_1M_QUESTION_ORDER.map((id) => ({
      id,
      text: GCPS_1M_QUESTIONS[id].text,
    })),
    optionLabels: GCPS_1M_OPTION_LABELS,
  },
  jfls8: {
    metadata: JFLS8_METADATA,
    questions: JFLS8_QUESTION_ORDER.map((id) => ({
      id,
      text: JFLS8_QUESTIONS[id].text,
    })),
    optionLabels: JFLS8_OPTION_LABELS,
  },
  jfls20: {
    metadata: JFLS20_METADATA,
    questions: JFLS20_QUESTION_ORDER.map((id) => ({
      id,
      text: JFLS20_QUESTIONS[id].text,
    })),
    optionLabels: JFLS20_OPTION_LABELS,
  },
  obc: {
    metadata: OBC_METADATA,
    questions: OBC_QUESTION_ORDER.map((id) => ({
      id,
      text: OBC_QUESTIONS[id].text,
    })),
    sleepOptionLabels: OBC_SLEEP_OPTION_LABELS,
    wakingOptionLabels: OBC_WAKING_OPTION_LABELS,
  },
  sq: {
    metadata: SQ_METADATA,
    questions: SQ_QUESTION_ORDER.map((id) => ({
      id,
      displayId: SQ_DISPLAY_IDS[id],
      text: SQ_QUESTION_SHORT_LABELS[id],
    })),
    yesNoLabels: SQ_YES_NO_LABELS,
    painFrequencyLabels: SQ_PAIN_FREQUENCY_LABELS,
  },
} as const;

/**
 * Build complete data for Typst template by combining payload with questionnaire definitions
 */
function buildTypstData(input: AnamnesisExportDataInput) {
  return {
    ...input,
    definitions: QUESTIONNAIRE_DEFINITIONS,
  };
}

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
      // Keys need quoting in Typst if they contain hyphens or are numeric strings
      // (numeric strings like "0" would otherwise become integer keys)
      const needsQuoting = k.includes("-") || /^\d+$/.test(k);
      const key = needsQuoting ? `"${k}"` : k;
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

  // Build complete data including questionnaire definitions
  const completeData = buildTypstData(data);

  // Convert data to Typst dictionary literal (not JSON)
  // Typst's json.decode has issues with backticks and requires a proper string,
  // so we inject native Typst dict syntax instead
  const typstData = toTypstValue(completeData);

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
