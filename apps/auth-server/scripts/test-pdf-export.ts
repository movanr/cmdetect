/**
 * Local test script for PDF export
 *
 * Usage: npx tsx scripts/test-pdf-export.ts
 */

import fs from "fs";
import path from "path";

// Sample export data matching AnamnesisExportData schema
const sampleData = {
  metadata: {
    exportDate: new Date().toISOString(),
    caseId: "test-case-123",
    organizationName: "Test Praxis",
  },
  patient: {
    firstName: "Max",
    lastName: "Mustermann",
    dateOfBirth: "1990-05-15",
    clinicInternalId: "PAT-001",
  },
  questionnaires: {
    phq4: {
      total: 6,
      maxTotal: 12,
      anxiety: 3,
      maxAnxiety: 6,
      depression: 3,
      maxDepression: 6,
    },
    gcps1m: {
      cpi: 45,
      cpiLevel: "low",
      interferenceScore: 30,
      interferencePoints: 1,
      disabilityDays: 5,
      disabilityDaysPoints: 1,
      totalDisabilityPoints: 2,
      grade: 2,
      gradeInterpretation: {
        grade: 2,
        label: "High Intensity",
        labelDe: "Hohe Intensitaet",
      },
    },
    jfls8: {
      globalScore: 1.2,
      maxScore: 10,
      answeredCount: 8,
      totalQuestions: 8,
      missingCount: 0,
      isValid: true,
      limitationLevel: "mild",
      limitationInterpretation: {
        label: "Mild Limitation",
        labelDe: "Leichte Einschraenkung",
      },
    },
    obc: {
      totalScore: 20,
      maxScore: 84,
      answeredCount: 21,
      totalQuestions: 21,
      riskLevel: "elevated",
      riskInterpretation: {
        label: "Elevated Risk",
        labelDe: "Erhoehtes Risiko",
      },
    },
    sq: {
      answers: { SQ1: "yes", SQ5: "no" },
      screeningNegative: false,
      reviewedAt: new Date().toISOString(),
    },
  },
  painDrawing: {
    score: {
      regionCount: 2,
      affectedRegions: ["head-right", "head-left"],
      elementCounts: {
        "head-right": { shadings: 3, points: 2, arrows: 1, total: 6 },
        "head-left": { shadings: 2, points: 1, arrows: 0, total: 3 },
      },
      totalElements: 9,
      patterns: {
        hasHeadPain: true,
        hasOralPain: false,
        hasBodyPain: false,
        hasWidespreadPain: false,
      },
      riskLevel: "regional",
      interpretation: {
        labelDe: "Regionaler Schmerz",
        descriptionDe: "Schmerzen in mehreren zusammenhaengenden Regionen",
      },
    },
    images: {},
  },
};

/**
 * Convert a JavaScript value to Typst dictionary literal syntax.
 */
function toTypstValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "none";
  }

  if (typeof value === "string") {
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
    return `(${items},)`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return "(:)";
    }
    const pairs = entries.map(([k, v]) => {
      const key = k.includes("-") ? `"${k}"` : k;
      return `${key}: ${toTypstValue(v)}`;
    });
    return `(${pairs.join(", ")})`;
  }

  return "none";
}

async function testPdfExport() {
  console.log("Testing PDF export locally...\n");

  // 1. Read the template
  const templatePath = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "packages",
    "pdf-templates",
    "templates",
    "anamnesis-report.typ"
  );

  console.log("Template path:", templatePath);

  if (!fs.existsSync(templatePath)) {
    console.error("Template not found at:", templatePath);
    process.exit(1);
  }

  const templateContent = fs.readFileSync(templatePath, "utf-8");
  console.log("Template loaded, length:", templateContent.length, "chars\n");

  // 2. Convert data to Typst dictionary literal
  const typstData = toTypstValue(sampleData);
  console.log("Typst data length:", typstData.length, "chars\n");

  // 3. Create the modified template - inject Typst dict directly
  const templateWithData = `
#let data = ${typstData}

${templateContent.replace('#let data = json(sys.inputs.data)', '// Data injected above')}
`;

  // 4. Write out the processed template for inspection
  const debugOutputPath = path.resolve(__dirname, "debug-template.typ");
  fs.writeFileSync(debugOutputPath, templateWithData);
  console.log("Debug template written to:", debugOutputPath);

  // 5. Try to compile with typst.ts
  console.log("\nAttempting Typst compilation...\n");

  try {
    const { $typst } = await import("@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs");

    const pdfBytes = await $typst.pdf({ mainContent: templateWithData });

    if (pdfBytes) {
      const outputPath = path.resolve(__dirname, "test-output.pdf");
      fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
      console.log("SUCCESS! PDF written to:", outputPath);
      console.log("PDF size:", pdfBytes.length, "bytes");
    } else {
      console.error("Typst returned empty PDF");
    }
  } catch (error) {
    console.error("Typst compilation failed:");
    console.error(error);
    process.exit(1);
  }
}

testPdfExport();
