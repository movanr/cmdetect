/**
 * Section-by-section examination report formatter.
 *
 * Produces structured data from examination FormValues, consumable by
 * both the React PrintableBefundbericht and (later) DOCX generator.
 *
 * Report content rules:
 * - Positive findings only — negative findings omitted (convention: not mentioned = unremarkable)
 * - Measurements always shown regardless of clinical significance
 * - Negative meta-fields suppressed (e.g., "terminated: no" is not shown)
 * - Fully unremarkable sections collapsed to "[Section]: unauffällig"
 * - Qualifiers (familiar pain, headache, etc.) as compact inline tags
 * - Section order 1–11 preserved
 * - Unexamined sections (not in completedSections) omitted entirely
 */

import {
  E3_OPENING_PATTERNS,
  E8_LOCKING_TYPE_LABELS,
  E8_REDUCTION_LABELS,
  getValueAtPath as get,
  getPalpationPainQuestions,
  JOINT_SOUND_LABELS,
  MOVEMENT_TYPE_LABELS,
  OPENING_TYPE_LABELS,
  PAIN_TYPES,
  PALPATION_MODES,
  PALPATION_REGIONS,
  PALPATION_SITES,
  REGIONS,
  SECTION_LABELS,
  SIDE_KEYS,
  SITES_BY_GROUP,
  type E8LockingType,
  type E8Reduction,
  type MovementType,
  type OpeningType,
  type PalpationSite,
  type Region,
  type SectionId,
  type Side,
} from "@cmdetect/dc-tmd";
import type { FormValues } from "../../examination";

// ============================================================================
// TYPES
// ============================================================================

export interface FormattedLine {
  text: string;
  indent?: number;
}

export interface FormattedSection {
  number: number;
  title: string;
  /** true = section was examined but all unremarkable (no positive findings, no measurements) */
  unremarkable: boolean;
  /** Section-specific label for unremarkable state (e.g., "Keine Schmerzen", "Keine Gelenkgeräusche") */
  unremarkableLabel: string;
  lines: FormattedLine[];
}

// ============================================================================
// SHARED HELPERS
// ============================================================================

function v(data: unknown, path: string): unknown {
  return get(data, path);
}

function regionLabel(region: Region): string {
  if (region === "tmj") return "Kiefergelenk";
  if (region === "otherMast") return "Andere Kaumuskulatur";
  if (region === "nonMast") return "Nicht-Kaumuskulatur";
  return REGIONS[region];
}

function line(text: string, indent?: number): FormattedLine {
  return indent ? { text, indent } : { text };
}

// ============================================================================
// E1: Schmerzlokalisation
// ============================================================================

const E1_PAIN_LABELS: Record<string, string> = {
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "Kiefergelenk",
  otherMast: "Andere Kaumuskulatur",
  nonMast: "Nicht-Kaumuskulatur",
};

const E1_HEADACHE_LABELS: Record<string, string> = {
  temporalis: "Temporalis",
  other: "Andere",
};

function formatBilateralLocations(
  data: unknown,
  pathRight: string,
  pathLeft: string,
  labels: Record<string, string>
): string | null {
  const rightArr = v(data, pathRight) as string[] | undefined;
  const leftArr = v(data, pathLeft) as string[] | undefined;
  const rightLocs = (rightArr ?? []).filter((l) => l !== "none");
  const leftLocs = (leftArr ?? []).filter((l) => l !== "none");

  if (rightLocs.length === 0 && leftLocs.length === 0) return null;

  const parts: string[] = [];
  for (const loc of new Set([...rightLocs, ...leftLocs])) {
    const label = labels[loc] ?? loc;
    const onRight = rightLocs.includes(loc);
    const onLeft = leftLocs.includes(loc);
    if (onRight && onLeft) parts.push(`${label} (beidseitig)`);
    else if (onRight) parts.push(`${label} (rechts)`);
    else parts.push(`${label} (links)`);
  }
  return parts.join(", ");
}

function formatE1(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];

  const pain = formatBilateralLocations(
    data,
    "e1.painLocation.right",
    "e1.painLocation.left",
    E1_PAIN_LABELS
  );
  if (pain) lines.push(line(`Schmerz: ${pain}.`));

  const headache = formatBilateralLocations(
    data,
    "e1.headacheLocation.right",
    "e1.headacheLocation.left",
    E1_HEADACHE_LABELS
  );
  if (headache) lines.push(line(`Kopfschmerz: ${headache}.`));

  return lines;
}

// ============================================================================
// E2: Schneidekantenverhältnisse
// ============================================================================

function formatE2(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];

  const selection = v(data, "e2.referenceTooth.selection") as string | undefined;
  if (selection != null) {
    const toothLabels: Record<string, string> = { tooth11: "Zahn 11", tooth21: "Zahn 21" };
    const otherTooth = v(data, "e2.referenceTooth.otherTooth") as string | undefined;
    const label =
      selection === "other" && otherTooth
        ? `Zahn ${otherTooth}`
        : (toothLabels[selection] ?? selection);
    lines.push(line(`Referenzzahn: ${label}`));
  }

  const hov = v(data, "e2.horizontalOverjet") as number | undefined;
  if (hov != null) lines.push(line(`Horizontaler Überbiss: ${hov} mm`));

  const vov = v(data, "e2.verticalOverlap") as number | undefined;
  if (vov != null) lines.push(line(`Vertikaler Überbiss: ${vov} mm`));

  const direction = v(data, "e2.midlineDeviation.direction") as string | undefined;
  if (direction != null) {
    if (direction === "na") {
      lines.push(line("Mittellinienabweichung: N/A"));
    } else {
      const mm = v(data, "e2.midlineDeviation.mm") as number | undefined;
      const dirLabel = direction === "right" ? "rechts" : "links";
      lines.push(line(`Mittellinienabweichung: ${mm ?? 0} mm nach ${dirLabel}`));
    }
  }

  return lines;
}

// ============================================================================
// E3: Öffnungs- und Schließmuster
// ============================================================================

function formatE3(data: unknown): FormattedLine[] {
  const pattern = v(data, "e3.pattern") as string | undefined;
  if (pattern == null) return [];
  const label = E3_OPENING_PATTERNS[pattern as keyof typeof E3_OPENING_PATTERNS] ?? pattern;
  return [line(`Öffnungsmuster: ${label}`)];
}

// ============================================================================
// E4/E5 SHARED: Bilateral Pain Interview (positive-only, inline qualifiers)
// ============================================================================

const MOVEMENT_REGIONS: readonly Region[] = [
  "temporalis",
  "masseter",
  "tmj",
  "otherMast",
  "nonMast",
];

/**
 * Formats positive pain findings for a movement step.
 * Returns null if no positive findings on either side.
 * Format: "Label — Rechts: Masseter (bekannter Schmerz), Gelenk. Links: Temporalis."
 */
function formatMovementPain(data: unknown, prefix: string, label: string): FormattedLine | null {
  const sideParts: string[] = [];

  for (const side of SIDE_KEYS) {
    const findings: string[] = [];

    for (const region of MOVEMENT_REGIONS) {
      const pain = v(data, `${prefix}.${side}.${region}.pain`);
      if (pain !== "yes") continue;

      // Collect positive qualifiers as inline tags
      const qualifiers: string[] = [];
      const fp = v(data, `${prefix}.${side}.${region}.familiarPain`);
      if (fp === "yes") qualifiers.push("bekannter Schmerz");
      const fh = v(data, `${prefix}.${side}.${region}.familiarHeadache`);
      if (fh === "yes") qualifiers.push("bekannter Kopfschmerz");

      const rLabel = regionLabel(region);
      findings.push(qualifiers.length > 0 ? `${rLabel} (${qualifiers.join(", ")})` : rLabel);
    }

    if (findings.length > 0) {
      sideParts.push(`${side === "left" ? "Links" : "Rechts"}: ${findings.join(", ")}`);
    }
  }

  if (sideParts.length === 0) return null;
  return line(`${label} — ${sideParts.join(". ")}.`);
}

// ============================================================================
// E4: Öffnungs- und Schließbewegungen
// ============================================================================

function formatE4(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];
  const openingTypes: OpeningType[] = ["painFree", "maxUnassisted", "maxAssisted"];

  // Measurements (always shown)
  for (const ot of openingTypes) {
    const label = OPENING_TYPE_LABELS[ot];
    const refused = v(data, `e4.${ot}.refused`);
    if (refused === true) {
      lines.push(line(`${label}: verweigert`));
      continue;
    }
    const mm = v(data, `e4.${ot}.measurement`) as number | undefined;
    if (mm != null) lines.push(line(`${label}: ${mm} mm`));
  }

  // Terminated — positive meta-field only
  if (v(data, "e4.maxAssisted.terminated") === true) {
    lines.push(line("Untersuchung durch Patient abgebrochen."));
  }

  // Pain findings (positive only, inline qualifiers)
  for (const ot of ["maxUnassisted", "maxAssisted"] as const) {
    if (v(data, `e4.${ot}.interviewRefused`) === true) {
      lines.push(line(`${OPENING_TYPE_LABELS[ot]} — Schmerzabfrage verweigert.`));
      continue;
    }
    const painLine = formatMovementPain(data, `e4.${ot}`, OPENING_TYPE_LABELS[ot]);
    if (painLine) lines.push(painLine);
  }

  return lines;
}

// ============================================================================
// E5: Lateral- und Protrusionsbewegungen
// ============================================================================

function formatE5(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];
  const movementTypes: MovementType[] = ["lateralRight", "lateralLeft", "protrusive"];

  for (const mt of movementTypes) {
    const label = MOVEMENT_TYPE_LABELS[mt];

    // Measurement (always shown)
    const refused = v(data, `e5.${mt}.refused`);
    if (refused === true) {
      lines.push(line(`${label}: verweigert`));
    } else {
      const mm = v(data, `e5.${mt}.measurement`) as number | undefined;
      if (mm != null) lines.push(line(`${label}: ${mm} mm`));
    }

    // Pain findings (positive only)
    if (v(data, `e5.${mt}.interviewRefused`) === true) {
      lines.push(line(`${label} — Schmerzabfrage verweigert.`));
    } else {
      const painLine = formatMovementPain(data, `e5.${mt}`, label);
      if (painLine) lines.push(painLine);
    }
  }

  return lines;
}

// ============================================================================
// E6: Gelenkgeräusche bei Öffnung und Schließbewegungen
// ============================================================================

function formatE6(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];

  for (const side of SIDE_KEYS) {
    const prefix = `e6.${side}`;
    const findings: string[] = [];

    // Click — only report positive examiner/patient findings
    const clickParts: string[] = [];
    if (v(data, `${prefix}.click.examinerOpen`) === "yes") clickParts.push("Öffnen");
    if (v(data, `${prefix}.click.examinerClose`) === "yes") clickParts.push("Schließen");
    const clickPatient = v(data, `${prefix}.click.patient`) === "yes";

    if (clickParts.length > 0 || clickPatient) {
      let detail = JOINT_SOUND_LABELS.click;
      if (clickParts.length > 0) detail += ` beim ${clickParts.join(" und ")}`;
      if (clickPatient) detail += ", vom Patient bemerkt";

      // Pain qualifiers — only when positive
      if (clickPatient) {
        const painWithClick = v(data, `${prefix}.click.painWithClick`);
        if (painWithClick === "yes") {
          const fp = v(data, `${prefix}.click.familiarPain`);
          detail += fp === "yes" ? ", schmerzhaft (bekannter Schmerz)" : ", schmerzhaft";
        }
      }
      findings.push(detail);
    }

    // Crepitus
    const crepParts: string[] = [];
    if (v(data, `${prefix}.crepitus.examinerOpen`) === "yes") crepParts.push("Öffnen");
    if (v(data, `${prefix}.crepitus.examinerClose`) === "yes") crepParts.push("Schließen");
    const crepPatient = v(data, `${prefix}.crepitus.patient`) === "yes";

    if (crepParts.length > 0 || crepPatient) {
      let detail = JOINT_SOUND_LABELS.crepitus;
      if (crepParts.length > 0) detail += ` beim ${crepParts.join(" und ")}`;
      if (crepPatient) detail += ", vom Patient bemerkt";
      findings.push(detail);
    }

    if (findings.length > 0) {
      const sLabel = side === "left" ? "Links" : "Rechts";
      lines.push(line(`${sLabel}: ${findings.join(". ")}.`));
    }
  }

  return lines;
}

// ============================================================================
// E7: Gelenkgeräusche bei Lateralbewegungen und Protrusion
// ============================================================================

function formatE7(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];

  for (const side of SIDE_KEYS) {
    const prefix = `e7.${side}`;
    const findings: string[] = [];

    // Click
    const clickEx = v(data, `${prefix}.click.examiner`) === "yes";
    const clickPt = v(data, `${prefix}.click.patient`) === "yes";

    if (clickEx || clickPt) {
      let detail = JOINT_SOUND_LABELS.click;
      if (clickEx) detail += " (Untersucher)";
      if (clickPt) detail += clickEx ? ", vom Patient bemerkt" : " (vom Patient bemerkt)";

      if (clickPt) {
        const painWithClick = v(data, `${prefix}.click.painWithClick`);
        if (painWithClick === "yes") {
          const fp = v(data, `${prefix}.click.familiarPain`);
          detail += fp === "yes" ? ", schmerzhaft (bekannter Schmerz)" : ", schmerzhaft";
        }
      }
      findings.push(detail);
    }

    // Crepitus
    const crepEx = v(data, `${prefix}.crepitus.examiner`) === "yes";
    const crepPt = v(data, `${prefix}.crepitus.patient`) === "yes";

    if (crepEx || crepPt) {
      let detail = JOINT_SOUND_LABELS.crepitus;
      if (crepEx) detail += " (Untersucher)";
      if (crepPt) detail += crepEx ? ", vom Patient bemerkt" : " (vom Patient bemerkt)";
      findings.push(detail);
    }

    if (findings.length > 0) {
      const sLabel = side === "left" ? "Links" : "Rechts";
      lines.push(line(`${sLabel}: ${findings.join(". ")}.`));
    }
  }

  return lines;
}

// ============================================================================
// E8: Gelenkblockierung
// ============================================================================

function formatE8(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];
  const lockingTypes: E8LockingType[] = ["closedLocking", "openLocking"];

  for (const side of SIDE_KEYS) {
    const sideFindings: string[] = [];

    for (const lt of lockingTypes) {
      if (v(data, `e8.${side}.${lt}.locking`) !== "yes") continue;
      const reduction = v(data, `e8.${side}.${lt}.reduction`) as E8Reduction | undefined;
      const reductionLabel = reduction ? E8_REDUCTION_LABELS[reduction] : undefined;
      const detail = reductionLabel
        ? `${E8_LOCKING_TYPE_LABELS[lt]} (Reduktion: ${reductionLabel})`
        : E8_LOCKING_TYPE_LABELS[lt];
      sideFindings.push(detail);
    }

    if (sideFindings.length > 0) {
      const sLabel = side === "left" ? "Links" : "Rechts";
      lines.push(line(`${sLabel}: ${sideFindings.join("; ")}.`));
    }
  }

  return lines;
}

// ============================================================================
// E9/E10 SHARED: Palpation (positive-only, inline qualifiers)
// ============================================================================

function formatPalpationSide(
  data: unknown,
  sectionKey: "e9" | "e10",
  side: Side,
  sitesByRegion: Record<string, readonly PalpationSite[]>
): FormattedLine[] {
  const findings: string[] = [];

  const refused = v(data, `${sectionKey}.${side}.refused`);
  if (refused === true) {
    return [line(`${side === "left" ? "Links" : "Rechts"}: verweigert`)];
  }

  for (const sites of Object.values(sitesByRegion)) {
    for (const site of sites) {
      if (v(data, `${sectionKey}.${side}.${site}.pain`) !== "yes") continue;

      // Collect positive qualifiers
      const qualifiers: string[] = [];
      const questions = getPalpationPainQuestions(site);
      for (const q of questions) {
        if (q === "pain") continue;
        if (v(data, `${sectionKey}.${side}.${site}.${q}`) === "yes") {
          qualifiers.push(PAIN_TYPES[q]);
        }
      }

      const siteLabel = PALPATION_SITES[site];
      findings.push(qualifiers.length > 0 ? `${siteLabel} (${qualifiers.join(", ")})` : siteLabel);
    }
  }

  if (findings.length === 0) return [];

  const sLabel = side === "left" ? "Links" : "Rechts";
  return [line(`${sLabel}: ${findings.join("; ")}.`)];
}

// ============================================================================
// E9: Palpation Muskeln & Kiefergelenk
// ============================================================================

function formatE9(data: unknown): FormattedLine[] {
  const lines: FormattedLine[] = [];

  // Palpation mode — always shown (it's a measurement-like parameter)
  const mode = v(data, "e9.palpationMode") as string | undefined;
  if (mode) {
    const modeLabel = PALPATION_MODES[mode as keyof typeof PALPATION_MODES] ?? mode;
    lines.push(line(`Palpationsmodus: ${modeLabel}`));
  }

  const e9Regions: Record<string, readonly PalpationSite[]> = {};
  for (const region of PALPATION_REGIONS) {
    e9Regions[region] = SITES_BY_GROUP[region];
  }

  for (const side of SIDE_KEYS) {
    lines.push(...formatPalpationSide(data, "e9", side, e9Regions));
  }

  return lines;
}

// ============================================================================
// E10: Ergänzende Muskelschmerzen bei Palpation
// ============================================================================

function formatE10(data: unknown): FormattedLine[] {
  const e10Regions: Record<string, readonly PalpationSite[]> = {
    nonMast: ["posteriorMandibular", "submandibular"],
    otherMast: ["lateralPterygoid", "temporalisTendon"],
  };

  const lines: FormattedLine[] = [];
  for (const side of SIDE_KEYS) {
    lines.push(...formatPalpationSide(data, "e10", side, e10Regions));
  }
  return lines;
}

// ============================================================================
// E11: Untersucherkommentare
// ============================================================================

function formatE11(data: unknown): FormattedLine[] {
  const comment = v(data, "e11.comment") as string | undefined;
  if (comment == null || comment.trim() === "") return [];
  return [line(comment)];
}

// ============================================================================
// ENTRY POINT
// ============================================================================

/** Section-specific labels for when a section has no positive findings.
 *  Uses the natural negation of what the section examines. */
const UNREMARKABLE_LABELS: Record<SectionId, string> = {
  e1: "Keine Schmerzen / Kopfschmerzen angegeben.",
  e2: "Keine Messwerte vorhanden.", // unlikely — E2 always has measurements when completed
  e3: "Kein Öffnungsmuster dokumentiert.", // unlikely — always has a value
  e4: "Keine Messwerte vorhanden.", // unlikely — E4 always has measurements
  e5: "Keine Messwerte vorhanden.", // unlikely — E5 always has measurements
  e6: "Keine Gelenkgeräusche.",
  e7: "Keine Gelenkgeräusche.",
  e8: "Keine Blockierung.",
  e9: "Kein Schmerz bei Palpation.",
  e10: "Kein Schmerz bei Palpation.",
  e11: "Keine Kommentare.",
};

const SECTION_FORMATTERS: Record<SectionId, (data: unknown) => FormattedLine[]> = {
  e1: formatE1,
  e2: formatE2,
  e3: formatE3,
  e4: formatE4,
  e5: formatE5,
  e6: formatE6,
  e7: formatE7,
  e8: formatE8,
  e9: formatE9,
  e10: formatE10,
  e11: formatE11,
};

const SECTION_IDS: SectionId[] = [
  "e1",
  "e2",
  "e3",
  "e4",
  "e5",
  "e6",
  "e7",
  "e8",
  "e9",
  "e10",
  "e11",
];

/**
 * Format all examination sections for the report.
 *
 * - Sections not in completedSections are omitted entirely (unexamined = excluded)
 * - Sections with no positive findings and no measurements are marked unremarkable
 * - Only positive findings and measurements are included in section lines
 */
export function formatAllExaminationSections(
  data: FormValues,
  completedSections: SectionId[]
): FormattedSection[] {
  const completed = new Set(completedSections);
  const sections: FormattedSection[] = [];

  for (let idx = 0; idx < SECTION_IDS.length; idx++) {
    const id = SECTION_IDS[idx];
    if (!completed.has(id)) continue; // unexamined — omit entirely

    const number = idx + 1;
    const title = SECTION_LABELS[id].full;
    const formatter = SECTION_FORMATTERS[id];
    const lines = formatter(data);

    sections.push({
      number,
      title,
      unremarkable: lines.length === 0,
      unremarkableLabel: UNREMARKABLE_LABELS[id],
      lines,
    });
  }

  return sections;
}
