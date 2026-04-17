/**
 * DC/TMD Form Sheet — jsPDF generation
 *
 * Draws a 2-page A4 PDF of the examination form, reading directly from
 * the nested FormValues structure. Layout mirrors the React form sheet.
 */

import type { jsPDF as JsPDFType } from "jspdf";
import {
  E1_PAIN_LOCATIONS,
  E1_PAIN_LOCATION_KEYS,
  E1_HEADACHE_LOCATIONS,
  E1_HEADACHE_LOCATION_KEYS,
  E2_REFERENCE_TEETH,
  E2_REFERENCE_TOOTH_KEYS,
  E2_MIDLINE_DIRECTIONS,
  E2_MIDLINE_DIRECTION_KEYS,
  E3_OPENING_PATTERNS,
  E3_OPENING_PATTERN_KEYS,
  OPENING_TYPE_LABELS,
  MOVEMENT_TYPE_LABELS,
  SECTION_LABELS,
  JOINT_SOUND_LABELS,
  E8_LOCKING_TYPE_DESCRIPTIONS,
  E10_SITE_KEYS,
  E10_PAIN_QUESTIONS,
  PALPATION_SITES,
  SITES_BY_GROUP,
  SITE_CONFIG,
  type PainType,
} from "@cmdetect/dc-tmd";

// === Types ===

interface PdfOptions {
  formValues: Record<string, unknown>;
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examDate?: string;
  examinerName?: string;
}

// === Helpers to read nested paths ===

function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

function getStr(obj: Record<string, unknown>, path: string): string | null {
  const v = get(obj, path);
  return typeof v === "string" ? v : null;
}

function getNum(obj: Record<string, unknown>, path: string): number | null {
  const v = get(obj, path);
  return typeof v === "number" ? v : null;
}

function getYesNo(obj: Record<string, unknown>, path: string): "yes" | "no" | null {
  const v = get(obj, path);
  return v === "yes" || v === "no" ? v : null;
}

function getArr(obj: Record<string, unknown>, path: string): string[] {
  const v = get(obj, path);
  return Array.isArray(v) ? v : [];
}

// === Layout constants ===

const W = 210; // A4 width
const MARGIN = 12;
const CW = W - 2 * MARGIN; // content width
const HW = CW / 2; // half width
const PAGE_BOTTOM = 282;

// === Regions & sides for grids ===

const SIDES = [
  { key: "right", label: "Rechte Seite" },
  { key: "left", label: "Linke Seite" },
] as const;

const MOVEMENT_REGIONS = [
  { key: "temporalis", label: "Temporalis", hasHeadache: true },
  { key: "masseter", label: "Masseter", hasHeadache: false },
  { key: "tmj", label: "Kiefergelenk", hasHeadache: false },
  { key: "otherMast", label: "Andere Kaum.", hasHeadache: false },
  { key: "nonMast", label: "Nicht-Kaum.", hasHeadache: false },
] as const;

// === PDF Generator ===

export async function generateFormSheetPDF(options: PdfOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { formValues: d, patientName, patientDob, clinicInternalId, examDate, examinerName } = options;
  const doc: JsPDFType = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  // --- Drawing primitives ---

  const gray = () => doc.setTextColor(100, 100, 100);
  const dark = () => doc.setTextColor(30, 30, 30);

  const checkPage = (need = 20) => {
    if (y + need > PAGE_BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const sectionHeader = (num: string, title: string) => {
    checkPage(10);
    doc.setFillColor(235, 235, 235);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(MARGIN, y, CW, 6, 0.5, 0.5, "FD");
    dark();
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${num}. ${title}`, MARGIN + 3, y + 4);
    y += 8;
  };

  /** Radio/checkbox option: drawn circle + label */
  const optionRow = (x: number, cy: number, label: string, sel: boolean) => {
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    if (sel) {
      doc.setFillColor(80, 80, 80);
      doc.circle(x + 1.5, cy, 1.5, "F");
    } else {
      doc.setFillColor(255, 255, 255);
      doc.circle(x + 1.5, cy, 1.5, "D");
    }
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    dark();
    doc.text(label, x + 4.5, cy + 0.8);
    return x + 5 + doc.getTextWidth(label) + 2.5;
  };

  /** N/J box pair — two bordered cells forming a clear visual unit */
  const njPair = (x: number, cy: number, val: "yes" | "no" | null) => {
    const bw = 4.5, bh = 3.5;
    const by = cy - bh / 2;
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.15);
    // N box
    doc.setFillColor(val === "no" ? 215 : 255, val === "no" ? 215 : 255, val === "no" ? 215 : 255);
    doc.rect(x, by, bw, bh, "FD");
    dark();
    doc.setFontSize(6);
    doc.setFont("helvetica", val === "no" ? "bold" : "normal");
    doc.text("N", x + bw / 2, cy + 0.9, { align: "center" });
    // J box
    doc.setFillColor(val === "yes" ? 215 : 255, val === "yes" ? 215 : 255, val === "yes" ? 215 : 255);
    doc.rect(x + bw, by, bw, bh, "FD");
    doc.setFont("helvetica", val === "yes" ? "bold" : "normal");
    doc.text("J", x + bw + bw / 2, cy + 0.9, { align: "center" });
    doc.setFont("helvetica", "normal");
  };

  const mmField = (x: number, cy: number, val: number | null) => {
    doc.setDrawColor(180, 180, 180);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, cy - 2, 10, 5, 0.5, 0.5, "FD");
    if (val != null) {
      dark();
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(String(val), x + 5, cy + 1.2, { align: "center" });
    }
    gray();
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text("mm", x + 11.5, cy + 1);
  };

  // --- Pain grid (E4, E5) ---

  const painGridPDF = (prefix: string, startY: number): number => {
    for (const [si, side] of SIDES.entries()) {
      const ox = MARGIN + si * HW;
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      gray();
      doc.text(side.label, ox + 2, startY);
      doc.setFont("helvetica", "normal");
      const c1 = ox + 26, c2 = ox + 40, c3 = ox + 54;
      doc.text("Schmerz", c1, startY);
      doc.text("Bekannter", c2, startY);
      doc.text("Schmerz", c2, startY + 2.5);
      doc.text("Bekannter", c3, startY);
      doc.text("Kopfschmerz", c3, startY + 2.5);
      let ry = startY + 5.5;
      for (const region of MOVEMENT_REGIONS) {
        doc.setFontSize(5.5);
        gray();
        doc.text(region.label, ox + 2, ry + 0.8);
        njPair(c1, ry, getYesNo(d, `${prefix}.${side.key}.${region.key}.pain`));
        njPair(c2, ry, getYesNo(d, `${prefix}.${side.key}.${region.key}.familiarPain`));
        if (region.hasHeadache) {
          njPair(c3, ry, getYesNo(d, `${prefix}.${side.key}.${region.key}.familiarHeadache`));
        }
        ry += 4;
      }
    }
    return startY + 5.5 + MOVEMENT_REGIONS.length * 4 + 1;
  };

  // --- Title ---

  dark();
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DC/TMD Untersuchungsbogen", W / 2, y + 5.5, { align: "center" });
  y += 9;

  // --- Patient info bar ---

  doc.setFillColor(245, 245, 245);
  doc.rect(MARGIN, y, CW, 7, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  gray();
  doc.text("Datum:", MARGIN + 2, y + 4.5);
  dark();
  doc.setFont("helvetica", "bold");
  doc.text(examDate ?? "", MARGIN + 15, y + 4.5);
  gray();
  doc.setFont("helvetica", "normal");
  doc.text("Patient:", MARGIN + 55, y + 4.5);
  dark();
  doc.setFont("helvetica", "bold");
  const displayName = patientName ?? clinicInternalId ?? "";
  doc.text(displayName, MARGIN + 70, y + 4.5);
  if (patientDob) {
    gray();
    doc.setFont("helvetica", "normal");
    doc.text(`(*${patientDob})`, MARGIN + 70 + doc.getTextWidth(displayName) + 2, y + 4.5);
  }
  if (examinerName) {
    gray();
    doc.setFont("helvetica", "normal");
    doc.text("Behandler:", MARGIN + 135, y + 4.5);
    dark();
    doc.setFont("helvetica", "bold");
    doc.text(examinerName, MARGIN + 155, y + 4.5);
  }
  y += 10;

  // ══════════════════════════════════
  // E1: Pain & headache location
  // ══════════════════════════════════

  sectionHeader("1a", "Schmerzlokalisation: letzte 30 Tage");
  const painLocArr = (side: string) => getArr(d, `e1.painLocation.${side}`);
  for (const [sk, sl] of [["right", "Rechte Seite"], ["left", "Linke Seite"]] as const) {
    dark();
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(sl, MARGIN + 2, y + 1);
    let cx = MARGIN + 28;
    for (const key of E1_PAIN_LOCATION_KEYS) {
      cx = optionRow(cx, y + 0.5, E1_PAIN_LOCATIONS[key], painLocArr(sk).includes(key));
    }
    y += 5;
  }
  y += 2;

  sectionHeader("1b", "Kopfschmerzlokalisation: letzte 30 Tage");
  const haLocArr = (side: string) => getArr(d, `e1.headacheLocation.${side}`);
  for (const [sk, sl] of [["right", "Rechte Seite"], ["left", "Linke Seite"]] as const) {
    dark();
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(sl, MARGIN + 2, y + 1);
    let cx = MARGIN + 28;
    for (const key of E1_HEADACHE_LOCATION_KEYS) {
      cx = optionRow(cx, y + 0.5, E1_HEADACHE_LOCATIONS[key], haLocArr(sk).includes(key));
    }
    y += 5;
  }
  y += 2;

  // ══════════════════════════════════
  // E2: Incisal relationships
  // ══════════════════════════════════

  sectionHeader("2", "Schneidekantenverhältnisse");
  dark();
  doc.setFontSize(6.5);
  doc.text("Referenzzahn:", MARGIN + 2, y + 1);
  let tx = MARGIN + 28;
  const refTooth = getStr(d, "e2.referenceTooth.selection");
  for (const key of E2_REFERENCE_TOOTH_KEYS) {
    tx = optionRow(tx, y + 0.5, E2_REFERENCE_TEETH[key], refTooth === key);
  }
  y += 6;
  gray();
  doc.setFontSize(6);
  doc.text("Horiz. Überbiss:", MARGIN + 2, y + 1);
  mmField(MARGIN + 32, y, getNum(d, "e2.horizontalOverjet"));
  doc.text("Vert. Überbiss:", MARGIN + 58, y + 1);
  mmField(MARGIN + 86, y, getNum(d, "e2.verticalOverlap"));
  doc.text("Mittellinienabw.:", MARGIN + 112, y + 1);
  const mlDir = getStr(d, "e2.midlineDeviation.direction");
  let mx = MARGIN + 140;
  for (const key of E2_MIDLINE_DIRECTION_KEYS) {
    mx = optionRow(mx, y + 0.5, E2_MIDLINE_DIRECTIONS[key], mlDir === key);
  }
  y += 5;
  if (mlDir && mlDir !== "na") {
    gray();
    doc.setFontSize(6);
    mmField(MARGIN + 140, y, getNum(d, "e2.midlineDeviation.mm"));
  }
  y += 5;

  // ══════════════════════════════════
  // E3: Opening pattern
  // ══════════════════════════════════

  sectionHeader("3", SECTION_LABELS.e3.full);
  let px = MARGIN + 2;
  const openingPattern = getStr(d, "e3.pattern");
  for (const key of E3_OPENING_PATTERN_KEYS) {
    px = optionRow(px, y + 0.5, E3_OPENING_PATTERNS[key], openingPattern === key);
  }
  y += 6;

  // ══════════════════════════════════
  // E4: Opening movements
  // ══════════════════════════════════

  sectionHeader("4", SECTION_LABELS.e4.full);
  dark();
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text(`A. ${OPENING_TYPE_LABELS.painFree}`, MARGIN + 2, y + 1);
  mmField(MARGIN + 50, y, getNum(d, "e4.painFree.measurement"));
  y += 6;

  doc.text(`B. ${OPENING_TYPE_LABELS.maxUnassisted}`, MARGIN + 2, y + 1);
  mmField(MARGIN + 50, y, getNum(d, "e4.maxUnassisted.measurement"));
  y = painGridPDF("e4.maxUnassisted", y + 5);
  y += 2;

  checkPage(35);
  dark();
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text(`C. ${OPENING_TYPE_LABELS.maxAssisted}`, MARGIN + 2, y + 1);
  mmField(MARGIN + 50, y, getNum(d, "e4.maxAssisted.measurement"));
  y = painGridPDF("e4.maxAssisted", y + 5);
  y += 3;

  // ══════════════════════════════════
  // E5: Lateral & protrusive movements
  // ══════════════════════════════════

  sectionHeader("5", SECTION_LABELS.e5.full);
  const movementEntries = [
    { key: "lateralRight", label: `A. ${MOVEMENT_TYPE_LABELS.lateralRight}` },
    { key: "lateralLeft", label: `B. ${MOVEMENT_TYPE_LABELS.lateralLeft}` },
    { key: "protrusive", label: `C. ${MOVEMENT_TYPE_LABELS.protrusive}` },
  ] as const;

  for (const entry of movementEntries) {
    checkPage(30);
    dark();
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(entry.label, MARGIN + 2, y + 1);
    mmField(MARGIN + 50, y, getNum(d, `e5.${entry.key}.measurement`));
    y = painGridPDF(`e5.${entry.key}`, y + 5);
    y += 2;
  }

  // ══════════════════════════════════
  // PAGE 2
  // ══════════════════════════════════

  // Continuation header (on new page if needed, otherwise just spacing)
  checkPage(40);
  if (y <= MARGIN + 2) {
    // We're on a fresh page — add continuation header
    doc.setFillColor(235, 235, 235);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(MARGIN, y, CW, 6, 0.5, 0.5, "FD");
    dark();
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(`DC/TMD – ${displayName} – ${examDate ?? ""}`, MARGIN + 3, y + 4);
    y += 9;
  }

  // ══════════════════════════════════
  // E6: Joint sounds during opening
  // ══════════════════════════════════

  const soundGrid6PDF = (startY: number): number => {
    for (const [si, side] of SIDES.entries()) {
      const ox = MARGIN + si * HW;
      const p = `e6.${side.key}`;
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      gray();
      doc.text(side.key === "right" ? "Rechtes Kiefergelenk" : "Linkes Kiefergelenk", ox + 2, startY);
      doc.setFont("helvetica", "normal");
      doc.text("Untersucher", ox + 26, startY);
      doc.text("Öffnen", ox + 26, startY + 2.5);
      doc.text("Untersucher", ox + 38, startY);
      doc.text("Schließen", ox + 38, startY + 2.5);
      doc.text("Patient", ox + 52, startY);
      doc.text("Schmerzhaftes", ox + 62, startY);
      doc.text("Knacken", ox + 62, startY + 2.5);
      doc.text("Bekannter", ox + 76, startY);
      doc.text("Schmerz", ox + 76, startY + 2.5);
      let ry = startY + 6;

      // Click row
      doc.text(JOINT_SOUND_LABELS.click, ox + 2, ry + 0.8);
      njPair(ox + 28, ry, getYesNo(d, `${p}.click.examinerOpen`));
      njPair(ox + 40, ry, getYesNo(d, `${p}.click.examinerClose`));
      njPair(ox + 52, ry, getYesNo(d, `${p}.click.patient`));
      njPair(ox + 63, ry, getYesNo(d, `${p}.click.painWithClick`));
      njPair(ox + 76, ry, getYesNo(d, `${p}.click.familiarPain`));
      ry += 4;

      // Crepitus row
      doc.text(JOINT_SOUND_LABELS.crepitus, ox + 2, ry + 0.8);
      njPair(ox + 28, ry, getYesNo(d, `${p}.crepitus.examinerOpen`));
      njPair(ox + 40, ry, getYesNo(d, `${p}.crepitus.examinerClose`));
      njPair(ox + 52, ry, getYesNo(d, `${p}.crepitus.patient`));
      ry += 4;
    }
    return startY + 6 + 2 * 4 + 1;
  };

  sectionHeader("6", SECTION_LABELS.e6.full);
  y = soundGrid6PDF(y);
  y += 2;

  // ══════════════════════════════════
  // E7: Joint sounds during lateral/protrusion
  // ══════════════════════════════════

  const soundGridPDF = (startY: number): number => {
    for (const [si, side] of SIDES.entries()) {
      const ox = MARGIN + si * HW;
      const p = `e7.${side.key}`;
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      gray();
      doc.text(side.key === "right" ? "Rechtes KG" : "Linkes KG", ox + 2, startY);
      doc.setFont("helvetica", "normal");
      doc.text("Untersucher", ox + 30, startY);
      doc.text("Patient", ox + 44, startY);
      doc.text("Schmerzhaftes", ox + 55, startY);
      doc.text("Knacken", ox + 55, startY + 2.5);
      doc.text("Bekannter", ox + 70, startY);
      doc.text("Schmerz", ox + 70, startY + 2.5);
      let ry = startY + 6;

      // Click
      doc.text(JOINT_SOUND_LABELS.click, ox + 2, ry + 0.8);
      njPair(ox + 30, ry, getYesNo(d, `${p}.click.examiner`));
      njPair(ox + 42, ry, getYesNo(d, `${p}.click.patient`));
      njPair(ox + 55, ry, getYesNo(d, `${p}.click.painWithClick`));
      njPair(ox + 68, ry, getYesNo(d, `${p}.click.familiarPain`));
      ry += 4;

      // Crepitus
      doc.text(JOINT_SOUND_LABELS.crepitus, ox + 2, ry + 0.8);
      njPair(ox + 30, ry, getYesNo(d, `${p}.crepitus.examiner`));
      njPair(ox + 42, ry, getYesNo(d, `${p}.crepitus.patient`));
      ry += 4;
    }
    return startY + 6 + 2 * 4 + 1;
  };

  sectionHeader("7", SECTION_LABELS.e7.full);
  y = soundGridPDF(y);
  y += 2;

  // ══════════════════════════════════
  // E8: Joint locking
  // ══════════════════════════════════

  sectionHeader("8", SECTION_LABELS.e8.full);
  for (const [si, side] of SIDES.entries()) {
    const ox = MARGIN + si * HW;
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    gray();
    doc.text(side.key === "right" ? "Rechtes Kiefergelenk" : "Linkes Kiefergelenk", ox + 2, y);
    doc.setFont("helvetica", "normal");
    doc.text("Blockade", ox + 40, y);
    doc.text("lösbar durch", ox + 55, y);
    doc.setFontSize(5);
    doc.text("Patient", ox + 55, y + 2.5);
    doc.text("Untersucher", ox + 67, y + 2.5);
    doc.setFontSize(5.5);
    let ry = y + 6;
    for (const [lk, ll] of [
      ["closedLocking", E8_LOCKING_TYPE_DESCRIPTIONS.closedLocking],
      ["openLocking", E8_LOCKING_TYPE_DESCRIPTIONS.openLocking],
    ] as const) {
      doc.text(ll, ox + 2, ry + 0.8);
      njPair(ox + 40, ry, getYesNo(d, `e8.${side.key}.${lk}.locking`));
      njPair(ox + 55, ry, getYesNo(d, `e8.${side.key}.${lk}.reducibleByPatient`));
      njPair(ox + 67, ry, getYesNo(d, `e8.${side.key}.${lk}.reducibleByExaminer`));
      ry += 4;
    }
  }
  y += 6 + 2 * 4 + 3;

  // ══════════════════════════════════
  // E9: Palpation
  // ══════════════════════════════════

  const PALP_COL_LABELS: Record<string, [string, string?]> = {
    pain: ["Schmerz"],
    familiarPain: ["Bekannter", "Schmerz"],
    familiarHeadache: ["Bekannter", "Kopfschmerz"],
    spreadingPain: ["Ausbreitender", "Schmerz"],
    referredPain: ["Übertragener", "Schmerz"],
  };

  const palpColHeader = (col: string, x: number, baseY: number) => {
    const lines = PALP_COL_LABELS[col];
    doc.text(lines[0], x, baseY);
    if (lines[1]) doc.text(lines[1], x, baseY + 2.5);
  };

  sectionHeader("9", SECTION_LABELS.e9.full);

  // Muscle palpation (temporalis + masseter)
  const muscleSites = [...SITES_BY_GROUP.temporalis, ...SITES_BY_GROUP.masseter];
  const muscleCols: PainType[] = ["pain", "familiarPain", "familiarHeadache", "spreadingPain", "referredPain"];

  const PALP_COL_W = 14; // column width for palpation grids

  for (const [si, side] of SIDES.entries()) {
    const ox = MARGIN + si * HW;
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    gray();
    doc.text(`${side.label} (1 kg)`, ox + 2, y);
    doc.setFont("helvetica", "normal");
    let colX = ox + 24;
    for (const col of muscleCols) {
      palpColHeader(col, colX, y);
      colX += PALP_COL_W;
    }
    let ry = y + 6.5;
    for (const site of muscleSites) {
      const config = SITE_CONFIG[site];
      const label = PALPATION_SITES[site].replace("Kiefergelenk ", "");
      doc.text(label.length > 18 ? label.slice(0, 18) : label, ox + 2, ry + 0.8);
      let cx = ox + 24;
      for (const col of muscleCols) {
        const hasCol =
          col === "familiarHeadache" ? config.hasHeadache :
          col === "spreadingPain" ? config.hasSpreading :
          true;
        if (hasCol) {
          njPair(cx, ry, getYesNo(d, `e9.${side.key}.${site}.${col}`));
        }
        cx += PALP_COL_W;
      }
      ry += 4;
    }
  }
  y += 6.5 + muscleSites.length * 4 + 2;

  // TMJ palpation
  const tmjSites = SITES_BY_GROUP.tmj;
  const tmjCols: PainType[] = ["pain", "familiarPain", "referredPain"];

  for (const [si, side] of SIDES.entries()) {
    const ox = MARGIN + si * HW;
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    gray();
    doc.text("Kiefergelenk", ox + 2, y);
    doc.setFont("helvetica", "normal");
    let colX = ox + 24;
    for (const col of tmjCols) {
      palpColHeader(col, colX, y);
      colX += PALP_COL_W;
    }
    let ry = y + 6.5;
    for (const site of tmjSites) {
      const label = PALPATION_SITES[site]
        .replace("Kiefergelenk ", "")
        .replace("(lateraler Pol)", "Lat. Pol (0,5kg)")
        .replace("(um den lateralen Pol)", "Um lat. Pol (1kg)");
      doc.text(label.length > 22 ? label.slice(0, 22) : label, ox + 2, ry + 0.8);
      let cx = ox + 24;
      for (const col of tmjCols) {
        njPair(cx, ry, getYesNo(d, `e9.${side.key}.${site}.${col}`));
        cx += PALP_COL_W;
      }
      ry += 4;
    }
  }
  y += 6.5 + tmjSites.length * 4 + 3;

  // ══════════════════════════════════
  // E10: Supplemental palpation
  // ══════════════════════════════════

  checkPage(30);
  sectionHeader("10", SECTION_LABELS.e10.full);
  for (const [si, side] of SIDES.entries()) {
    const ox = MARGIN + si * HW;
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    gray();
    doc.text(`${side.label} (0,5 kg)`, ox + 2, y);
    doc.setFont("helvetica", "normal");
    palpColHeader("pain", ox + 32, y);
    palpColHeader("familiarPain", ox + 32 + PALP_COL_W, y);
    palpColHeader("referredPain", ox + 32 + 2 * PALP_COL_W, y);
    let ry = y + 6.5;
    for (const site of E10_SITE_KEYS) {
      doc.text(PALPATION_SITES[site], ox + 2, ry + 0.8);
      let cx = ox + 32;
      for (const col of E10_PAIN_QUESTIONS) {
        njPair(cx, ry, getYesNo(d, `e10.${side.key}.${site}.${col}`));
        cx += PALP_COL_W;
      }
      ry += 4;
    }
  }
  y += 6.5 + E10_SITE_KEYS.length * 4 + 3;

  // ══════════════════════════════════
  // E11: Comments
  // ══════════════════════════════════

  checkPage(20);
  sectionHeader("11", SECTION_LABELS.e11.full);
  const comment = getStr(d, "e11.comment");
  if (comment) {
    gray();
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(comment, CW - 8);
    doc.text(lines, MARGIN + 4, y + 1);
    y += (lines as string[]).length * 3.5 + 2;
  }
  y += 6;

  // --- Footer ---

  doc.setFontSize(4.5);
  gray();
  doc.text(
    "Copyright International RDC/TMD Consortium Network. Deutsche Übersetzung: Asendorf A, Eberhard L, Universitätsklinikum Heidelberg & Schierz O, Universitätsmedizin Leipzig. V. 12/2018.",
    MARGIN,
    y
  );

  // --- Save ---

  const safeName = (patientName ?? clinicInternalId ?? "export").replace(/[^a-zA-ZäöüÄÖÜß0-9]/g, "_");
  doc.save(`DCTMD_${safeName}.pdf`);
}
