/**
 * Generate a DC/TMD Befundbericht as a DOCX document.
 *
 * Mirrors the structure of PrintableBefundbericht.tsx but outputs
 * a Word document.
 */

import {
  ALL_DIAGNOSES,
  PALPATION_SITES,
  REGIONS,
  generateAnamnesisText,
  getDiagnosisClinicalContext,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type SectionId,
  type Side,
} from "@cmdetect/dc-tmd";
import { Document, Packer, Paragraph, Tab, TabStopType, TextRun, UnderlineType } from "docx";
import { saveAs } from "file-saver";
import type { FormValues } from "../../examination";
import { generateExaminationNarrative } from "./befundbericht-examination";

// ============================================================================
// TYPES
// ============================================================================

interface ConfirmedDiagnosis {
  diagnosisId: DiagnosisId;
  side: Side;
  region: Region;
  site: PalpationSite | null;
}

interface QuestionnaireScore {
  instrument: string;
  score: string;
  /** Optional practitioner clinical note (rendered as an indented italic sub-line). */
  note?: string;
}

interface BefundberichtData {
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examinationDate?: string;
  examinerName?: string;
  criteriaData: unknown;
  confirmedDiagnoses: ConfirmedDiagnosis[];
  questionnaireScores?: QuestionnaireScore[];
  examinationData?: FormValues;
  completedSections?: SectionId[];
}

// ============================================================================
// HELPERS
// ============================================================================

function sideLabel(side: Side): string {
  return side === "left" ? "links" : "rechts";
}

// ============================================================================
// DOCX PRIMITIVES — one font, two sizes, plain paragraphs
// ============================================================================

const FONT = "Arial";
const SIZE = 20; // half-points → 10pt (body + headings)
const SIZE_SMALL = 18; // half-points → 9pt (footer only)

// Tab stops in twips (1 inch = 1440 twips, 1cm ≈ 567 twips)
const TAB_META = 3200; // ~5.6cm from margin — after "Untersuchungsdatum"
const TAB_SCORES = 1800; // ~3.2cm from margin — after short instrument names

function r(content: string, opts?: { bold?: boolean; underline?: boolean; italic?: boolean }): TextRun {
  return new TextRun({
    text: content,
    font: FONT,
    size: SIZE,
    bold: opts?.bold,
    underline: opts?.underline ? { type: UnderlineType.SINGLE } : undefined,
    italics: opts?.italic,
  });
}

/** Empty line spacer — more reliable than spacing.before across renderers. */
function spacer(): Paragraph {
  return new Paragraph({ children: [r("")], spacing: { after: 120 } });
}

/** Section heading — underlined, preceded by an empty line. */
function sectionHeading(text: string): Paragraph[] {
  return [
    spacer(),
    new Paragraph({
      children: [r(text, { underline: true })],
      spacing: { after: 120 },
    }),
  ];
}

/** Plain body line. */
function bodyLine(content: string): Paragraph {
  return new Paragraph({
    children: [r(content)],
    spacing: { after: 40 },
  });
}

/** Tab-aligned label → value row. Bold only for metadata, regular for scores. */
function tabRow(label: string, value: string, tab = TAB_META, bold = tab === TAB_META): Paragraph {
  return new Paragraph({
    children: [
      r(label),
      new TextRun({ children: [new Tab(), value], font: FONT, size: SIZE, bold }),
    ],
    tabStops: [{ type: TabStopType.LEFT, position: tab }],
    spacing: { after: 40 },
  });
}

// ============================================================================
// DOCUMENT GENERATION
// ============================================================================

function buildDocument(data: BefundberichtData): Document {
  const exportDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // ── Process data ────────────────────────────────────────────────────
  const anamnesisParagraphs = generateAnamnesisText(data.criteriaData);

  const narrativeParagraphs = data.examinationData
    ? generateExaminationNarrative(data.examinationData, data.completedSections ?? [])
    : [];

  const diagnoses = data.confirmedDiagnoses.map((d) => {
    const def = ALL_DIAGNOSES.find((diag) => diag.id === d.diagnosisId);
    const label = def?.nameDE ?? d.diagnosisId;
    const icd10 = getDiagnosisClinicalContext(d.diagnosisId).icd10;
    const site = d.site ? PALPATION_SITES[d.site] : null;
    const regionName = d.region === "tmj" ? "Kiefergelenk" : REGIONS[d.region];
    const suffix = site
      ? `(${site}, ${sideLabel(d.side)})`
      : `(${regionName}, ${sideLabel(d.side)})`;
    return `${label} [${icd10}] ${suffix}`;
  });

  const p: Paragraph[] = [];

  // ── Title + date ────────────────────────────────────────────────────

  const rightEdge = 11906 - 2 * 1440; // A4 - 2×margin ≈ 9026 twips
  p.push(
    new Paragraph({
      children: [
        r("DC/TMD Befundbericht", { bold: true }),
        new TextRun({ children: [new Tab(), exportDate], font: FONT, size: SIZE }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: rightEdge }],
      spacing: { after: 280 },
    })
  );

  // ── Patient metadata ───────────────────────────────────────────────

  const patientValue = [data.patientName, data.patientDob ? `geb. ${data.patientDob}` : undefined]
    .filter(Boolean)
    .join(", ");
  if (patientValue) p.push(tabRow("Patient", patientValue));
  if (data.clinicInternalId) p.push(tabRow("Patienten-ID", data.clinicInternalId));
  if (data.examinerName) p.push(tabRow("Untersucher", data.examinerName));
  if (data.examinationDate) p.push(tabRow("Untersuchungsdatum", data.examinationDate));

  // ── Diagnoses ─────────────────────────────────────────────────────

  if (diagnoses.length > 0) {
    p.push(...sectionHeading("Aktuelle Diagnosen (DC/TMD)"));
    for (const d of diagnoses) {
      p.push(bodyLine(d));
    }
  }

  // ── Anamnesis ─────────────────────────────────────────────────────

  if (anamnesisParagraphs.length > 0) {
    p.push(...sectionHeading("Anamnese (DC/TMD Achse I)"));
    for (const para of anamnesisParagraphs) {
      p.push(
        new Paragraph({
          children: [r(para)],
          spacing: { after: 120 },
        })
      );
    }
  }

  // ── Axis 2 scores ─────────────────────────────────────────────────

  if (data.questionnaireScores && data.questionnaireScores.length > 0) {
    p.push(...sectionHeading("Fragebogeninstrumente (DC/TMD Achse II)"));
    for (const qs of data.questionnaireScores) {
      p.push(tabRow(qs.instrument, qs.score, TAB_SCORES));
      if (qs.note) {
        p.push(
          new Paragraph({
            children: [r(`Anmerkung: ${qs.note}`, { italic: true })],
            indent: { left: TAB_SCORES },
            spacing: { after: 80 },
          })
        );
      }
    }
  }

  // ── Clinical examination (Fließtext, rule-driven) ─────────────────

  p.push(...sectionHeading("DC/TMD-Untersuchung (Vorschau U6)"));

  if (narrativeParagraphs.length > 0) {
    for (const para of narrativeParagraphs) {
      p.push(
        new Paragraph({
          children: [r(para)],
          spacing: { after: 120 },
        })
      );
    }
  } else {
    p.push(
      new Paragraph({
        children: [r("Keine Untersuchungsdaten vorhanden.", { italic: true })],
        spacing: { after: 80 },
      })
    );
  }

  // ── Footer ────────────────────────────────────────────────────────

  p.push(spacer());
  p.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Dieser Befundbericht wurde auf Grundlage der standardisierten DC/TMD-Untersuchung erstellt.",
          font: FONT,
          size: SIZE_SMALL,
          color: "999999",
        }),
      ],
    })
  );

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: p,
      },
    ],
  });
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function downloadBefundberichtDocx(
  data: BefundberichtData,
  filename: string
): Promise<void> {
  const doc = buildDocument(data);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
}
