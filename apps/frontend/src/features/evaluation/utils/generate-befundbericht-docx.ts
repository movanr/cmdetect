/**
 * Generate a DC/TMD Befundbericht as a DOCX document.
 *
 * Mirrors the structure and data processing of PrintableBefundbericht.tsx
 * but outputs a Word document instead of React elements.
 */

import {
  ALL_DIAGNOSES,
  E3_OPENING_PATTERNS,
  JOINT_SOUND_LABELS,
  MOVEMENT_TYPE_LABELS,
  OPENING_TYPE_LABELS,
  PALPATION_SITES,
  REGIONS,
  extractClinicalFindings,
  generateAnamnesisText,
  getValueAtPath as get,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type Side,
  type SignFinding,
  type SymptomDomain,
  type SymptomFinding,
} from "@cmdetect/dc-tmd";
import { Document, Packer, Paragraph, Tab, TabStopType, TextRun, UnderlineType } from "docx";
import { saveAs } from "file-saver";

// ============================================================================
// TYPES (same as PrintableBefundbericht)
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
}

// ============================================================================
// HELPERS (reused from PrintableBefundbericht)
// ============================================================================

function sideLabel(side: Side): string {
  return side === "left" ? "links" : "rechts";
}

function locationSuffix(region: Region | undefined, side: Side): string {
  if (!region) return `(${sideLabel(side)})`;
  const regionName = region === "tmj" ? "Kiefergelenk" : REGIONS[region];
  return `(${regionName}, ${sideLabel(side)})`;
}

// ── Joint sound details ────────────────────────────────────────────────

interface JointSoundFinding {
  type: "click" | "crepitus" | "locking" | "subluxation";
  label: string;
  detail?: string;
  side: Side;
}

function extractJointSoundDetails(
  symptoms: SymptomFinding[],
  criteriaData: unknown
): JointSoundFinding[] {
  const results: JointSoundFinding[] = [];

  for (const s of symptoms) {
    if (s.domain === "tmjClick") {
      const movements: string[] = [];
      if (get(criteriaData, `e6.${s.side}.click.examinerOpen`) === "yes") movements.push("Öffnen");
      if (get(criteriaData, `e6.${s.side}.click.examinerClose`) === "yes")
        movements.push("Schließen");
      if (get(criteriaData, `e7.${s.side}.click.examiner`) === "yes")
        movements.push("Lateralbewegung/Protrusion");
      results.push({
        type: "click",
        label: JOINT_SOUND_LABELS.click,
        detail: movements.length > 0 ? `bei ${movements.join(", ")}` : undefined,
        side: s.side,
      });
    } else if (s.domain === "tmjCrepitus") {
      const movements: string[] = [];
      if (get(criteriaData, `e6.${s.side}.crepitus.examinerOpen`) === "yes")
        movements.push("Öffnen");
      if (get(criteriaData, `e6.${s.side}.crepitus.examinerClose`) === "yes")
        movements.push("Schließen");
      if (get(criteriaData, `e7.${s.side}.crepitus.examiner`) === "yes")
        movements.push("Lateralbewegung/Protrusion");
      results.push({
        type: "crepitus",
        label: JOINT_SOUND_LABELS.crepitus,
        detail: movements.length > 0 ? `bei ${movements.join(", ")}` : undefined,
        side: s.side,
      });
    } else if (s.domain === "closedLocking") {
      results.push({ type: "locking", label: "Kieferklemme", side: s.side });
    } else if (s.domain === "limitedOpening") {
      results.push({ type: "locking", label: s.label, side: s.side });
    } else if (s.domain === "intermittentLocking") {
      results.push({
        type: "locking",
        label: "Intermittierende Kieferklemme mit Knackmuster",
        side: s.side,
      });
    } else if (s.domain === "subluxation") {
      results.push({ type: "subluxation", label: "Subluxation", side: s.side });
    }
  }

  return results;
}

// ── Measurement formatting ─────────────────────────────────────────────

interface FormattedMeasurement {
  label: string;
  value: string;
}

function formatMeasurements(signs: SignFinding[]): FormattedMeasurement[] {
  const measurements: FormattedMeasurement[] = [];

  const openingLabels: Record<string, string> = {
    "painFree.measurement": OPENING_TYPE_LABELS.painFree,
    "maxUnassisted.measurement": OPENING_TYPE_LABELS.maxUnassisted,
    "maxAssisted.measurement": OPENING_TYPE_LABELS.maxAssisted,
  };
  for (const sign of signs.filter((s) => s.section === "e4")) {
    const label = openingLabels[sign.field];
    if (label && typeof sign.value === "number") {
      measurements.push({ label, value: `${sign.value} mm` });
    }
  }

  const movementLabels: Record<string, string> = {
    "lateralLeft.measurement": MOVEMENT_TYPE_LABELS.lateralLeft,
    "lateralRight.measurement": MOVEMENT_TYPE_LABELS.lateralRight,
    "protrusive.measurement": MOVEMENT_TYPE_LABELS.protrusive,
  };
  for (const sign of signs.filter((s) => s.section === "e5")) {
    const label = movementLabels[sign.field];
    if (label && typeof sign.value === "number") {
      measurements.push({ label, value: `${sign.value} mm` });
    }
  }

  const openingPatternLabels: Record<string, string> = { ...E3_OPENING_PATTERNS };
  for (const sign of signs.filter((s) => s.section === "e3")) {
    if (sign.field === "openingPattern" && typeof sign.value === "string") {
      measurements.push({
        label: "Öffnungsmuster",
        value: openingPatternLabels[sign.value] ?? sign.value,
      });
    }
  }

  return measurements;
}

// ── Flat finding line formatters ───────────────────────────────────────

/** Collapse symptoms by (domain-group, region, side) into flat description lines. */
function formatSymptomLines(symptoms: SymptomFinding[]): string[] {
  const painDomains = new Set<SymptomDomain>([
    "familiarPainPalpation",
    "familiarPainOpening",
    "familiarPainMovement",
  ]);
  const headacheDomains = new Set<SymptomDomain>([
    "familiarHeadachePalpation",
    "familiarHeadacheOpening",
    "familiarHeadacheMovement",
  ]);

  // Collapse by (label-type, region, side) to avoid duplicates
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const s of symptoms) {
    let prefix: string | null = null;
    if (painDomains.has(s.domain)) prefix = "Bekannter Schmerz";
    else if (headacheDomains.has(s.domain)) prefix = "Bekannter Kopfschmerz";

    if (!prefix) continue;

    const key = `${prefix}-${s.region ?? "none"}-${s.side}`;
    if (seen.has(key)) continue;
    seen.add(key);

    lines.push(`${prefix} ${locationSuffix(s.region, s.side)}`);
  }

  return lines;
}

function formatJointSoundLines(sounds: JointSoundFinding[]): string[] {
  return sounds.map((f) => {
    const side = `(${sideLabel(f.side)})`;
    const detail = f.detail ? ` ${f.detail}` : "";
    return `${f.label} ${side}${detail}`;
  });
}

// ============================================================================
// DOCX PRIMITIVES — one font, two sizes, plain paragraphs
// ============================================================================

const FONT = "Arial";
const SIZE = 20; // half-points → 10pt (body + headings)
const SIZE_SMALL = 18; // half-points → 9pt (footer only)

// Tab stops in twips (1 inch = 1440 twips, 1cm ≈ 567 twips)
// A4 text area with 2.5cm margins ≈ 9300 twips wide
const TAB_META = 3200; // ~5.6cm from margin — after "Untersuchungsdatum"
const TAB_MEASUREMENT = 4800; // ~8.5cm from margin — after "Maximale passive Mundöffnung"
const TAB_SCORES = 1800; // ~3.2cm from margin — after short instrument names (GCS, PHQ-4)

function r(content: string, opts?: { bold?: boolean; underline?: boolean }): TextRun {
  return new TextRun({
    text: content,
    font: FONT,
    size: SIZE,
    bold: opts?.bold,
    underline: opts?.underline ? { type: UnderlineType.SINGLE } : undefined,
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
function line(content: string): Paragraph {
  return new Paragraph({
    children: [r(content)],
    spacing: { after: 40 },
  });
}

/** Tab-aligned label → value row. Bold only for metadata, regular for measurements/scores. */
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
  const findings = extractClinicalFindings(data.criteriaData);
  const measurements = formatMeasurements(findings.signs);
  const symptomLines = formatSymptomLines(findings.symptoms);
  const jointSounds = extractJointSoundDetails(findings.symptoms, data.criteriaData);
  const jointSoundLines = formatJointSoundLines(jointSounds);

  const diagnoses = data.confirmedDiagnoses.map((d) => {
    const def = ALL_DIAGNOSES.find((diag) => diag.id === d.diagnosisId);
    const label = def?.nameDE ?? d.diagnosisId;
    const site = d.site ? PALPATION_SITES[d.site] : null;
    const suffix = site ? `(${site}, ${sideLabel(d.side)})` : locationSuffix(d.region, d.side);
    return `${label} ${suffix}`;
  });

  const p: Paragraph[] = [];

  // ── Title + date ────────────────────────────────────────────────────

  // Right-aligned date: tab at far right edge of text area (A4 - 2×margin)
  const rightEdge = 11906 - 2 * 1440; // ~9026 twips
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

  // Combine name + DOB on one line (like the template)
  const patientValue = [data.patientName, data.patientDob ? `geb. ${data.patientDob}` : undefined]
    .filter(Boolean)
    .join(", ");
  if (patientValue) p.push(tabRow("Patient", patientValue));
  if (data.clinicInternalId) p.push(tabRow("Patienten-ID", data.clinicInternalId));
  if (data.examinerName) p.push(tabRow("Untersucher", data.examinerName));
  if (data.examinationDate) p.push(tabRow("Untersuchungsdatum", data.examinationDate));

  // ── Diagnoses (first, per template) ────────────────────────────────

  if (diagnoses.length > 0) {
    p.push(...sectionHeading("Aktuelle Diagnosen (DC/TMD)"));
    for (const d of diagnoses) {
      p.push(line(d));
    }
  }

  // ── Anamnesis ──────────────────────────────────────────────────────

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

  // ── Axis 2 scores ──────────────────────────────────────────────────

  if (data.questionnaireScores && data.questionnaireScores.length > 0) {
    p.push(...sectionHeading("Fragebogeninstrumente (DC/TMD Achse II)"));
    for (const qs of data.questionnaireScores) {
      p.push(tabRow(qs.instrument, qs.score, TAB_SCORES));
    }
  }

  // ── Clinical examination ───────────────────────────────────────────

  p.push(...sectionHeading("DC/TMD-Untersuchung"));

  // Measurements (tab-aligned at wider stop)
  for (const m of measurements) {
    p.push(tabRow(m.label, m.value, TAB_MEASUREMENT));
  }

  // Findings as flat text lines (with spacing before if measurements exist)
  const findingLines = [...symptomLines, ...jointSoundLines];
  if (findingLines.length > 0) {
    if (measurements.length > 0) {
      p.push(spacer());
    }
    for (const f of findingLines) {
      p.push(line(f));
    }
  }

  if (measurements.length === 0 && findingLines.length === 0) {
    p.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Keine klinischen Befunde vorhanden.",
            font: FONT,
            size: SIZE,
            italics: true,
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // ── Footer ─────────────────────────────────────────────────────────

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
