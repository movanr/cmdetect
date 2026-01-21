/**
 * Local test script for PDF export
 *
 * Usage: npx tsx scripts/test-pdf-export.ts
 */

import fs from "fs";
import path from "path";
import {
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

/**
 * Questionnaire definitions for Typst template
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
      score: {
        total: 6,
        maxTotal: 12,
        anxiety: 3,
        maxAnxiety: 6,
        depression: 3,
        maxDepression: 6,
      },
      answers: {
        PHQ4_1: "2",
        PHQ4_2: "1",
        PHQ4_3: "2",
        PHQ4_4: "1",
      },
    },
    gcps1m: {
      score: {
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
          label: "Hohe Intensitaet",
        },
      },
      answers: {
        GCPS_1: 5,
        GCPS_2: 6,
        GCPS_3: 4,
        GCPS_4: 3,
        GCPS_5: 2,
        GCPS_6: 4,
        GCPS_7: 5,
      },
    },
    jfls8: {
      score: {
        globalScore: 1.2,
        maxScore: 10,
        answeredCount: 8,
        totalQuestions: 8,
        missingCount: 0,
        isValid: true,
        limitationLevel: "mild",
        limitationInterpretation: {
          label: "Leichte Einschraenkung",
        },
      },
      answers: {
        JFLS8_1: "1",
        JFLS8_2: "2",
        JFLS8_3: "1",
        JFLS8_4: "1",
        JFLS8_5: "2",
        JFLS8_6: "1",
        JFLS8_7: "1",
        JFLS8_8: "0",
      },
    },
    obc: {
      score: {
        totalScore: 20,
        maxScore: 84,
        answeredCount: 21,
        totalQuestions: 21,
        riskLevel: "elevated",
        riskInterpretation: {
          label: "Erhoehtes Risiko",
        },
      },
      answers: {
        OBC_1: "1",
        OBC_2: "2",
        OBC_3: "1",
        OBC_4: "0",
        OBC_5: "1",
        OBC_6: "2",
        OBC_7: "1",
        OBC_8: "0",
        OBC_9: "1",
        OBC_10: "1",
        OBC_11: "2",
        OBC_12: "1",
        OBC_13: "0",
        OBC_14: "1",
        OBC_15: "2",
        OBC_16: "1",
        OBC_17: "0",
        OBC_18: "1",
        OBC_19: "1",
        OBC_20: "0",
        OBC_21: "1",
      },
    },
    sq: {
      answers: {
        SQ1: "yes",
        SQ2: { years: 2, months: 3 },
        SQ3: "intermittent",
        SQ4_A: "yes",
        SQ4_B: "no",
        SQ4_C: "yes",
        SQ4_D: "no",
        SQ5: "yes",
        SQ6: { years: 1, months: 0 },
        SQ7_A: "yes",
        SQ7_B: "no",
        SQ7_C: "no",
        SQ7_D: "yes",
        SQ8: "yes",
        SQ9: "no",
        SQ13: "no",
      },
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
        label: "Regionaler Schmerz",
        description: "Schmerzen in mehreren zusammenhaengenden Regionen",
      },
    },
    images: {},
  },
};

/**
 * Build complete data for Typst template by combining payload with questionnaire definitions
 */
function buildTypstData(input: typeof sampleData) {
  return {
    ...input,
    definitions: QUESTIONNAIRE_DEFINITIONS,
  };
}

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

  // 2. Build complete data with definitions
  const completeData = buildTypstData(sampleData);

  // 3. Convert data to Typst dictionary literal
  const typstData = toTypstValue(completeData);
  console.log("Typst data length:", typstData.length, "chars\n");

  // 4. Create the modified template - inject Typst dict directly
  const templateWithData = `
#let data = ${typstData}

${templateContent.replace('#let data = json(sys.inputs.data)', '// Data injected above')}
`;

  // 5. Write out the processed template for inspection
  const debugOutputPath = path.resolve(__dirname, "debug-template.typ");
  fs.writeFileSync(debugOutputPath, templateWithData);
  console.log("Debug template written to:", debugOutputPath);

  // 6. Try to compile with typst.ts
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
