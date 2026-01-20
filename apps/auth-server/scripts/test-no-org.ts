/**
 * Test PDF export without organizationName
 */

import fs from "fs";
import path from "path";

const sampleData = {
  metadata: {
    exportDate: new Date().toISOString(),
    caseId: "test-case-123",
    // No organizationName!
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
  },
};

function toTypstValue(value: unknown): string {
  if (value === null || value === undefined) return "none";
  if (typeof value === "string") {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    if (value.length === 0) return "()";
    return `(${value.map(toTypstValue).join(", ")},)`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "(:)";
    const pairs = entries.map(([k, v]) => {
      const key = k.includes("-") ? `"${k}"` : k;
      return `${key}: ${toTypstValue(v)}`;
    });
    return `(${pairs.join(", ")})`;
  }
  return "none";
}

async function test() {
  const templatePath = path.resolve(__dirname, "..", "..", "..", "packages", "pdf-templates", "templates", "anamnesis-report.typ");
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const typstData = toTypstValue(sampleData);

  const templateWithData = `#let data = ${typstData}\n\n${templateContent.replace('#let data = json(sys.inputs.data)', '// Data injected above')}`;

  try {
    const { $typst } = await import("@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs");
    const pdfBytes = await $typst.pdf({ mainContent: templateWithData });
    if (pdfBytes) {
      console.log("SUCCESS! No organizationName works. Size:", pdfBytes.length, "bytes");
    } else {
      console.log("FAIL: Empty PDF");
    }
  } catch (error) {
    console.log("FAIL:", error);
  }
}

test();
