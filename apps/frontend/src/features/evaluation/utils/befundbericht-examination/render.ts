import { E3_OPENING_PATTERNS, REGIONS, type Region } from "@cmdetect/dc-tmd";
import type {
  Finding,
  HeadacheLocation,
  SideOrBoth,
  U10Finding,
  U10RefusedFinding,
  U1aFinding,
  U1bFinding,
  U2Finding,
  U3Finding,
  U4Finding,
  U5Finding,
  U6Finding,
  U7Finding,
  U8Finding,
  U9MuscleFinding,
  U9RefusedFinding,
  U9TmjFinding,
} from "./types";
import { sideAdv, tmjLocation } from "./labels";

/**
 * Renders a single Finding as one complete German sentence (ends with period).
 * Follows meta-rule 1.1: [Phänomen] + [Lokalisation] + [Bewegung] + [Quellen] + [Qualifikatoren].
 */
export function renderSentence(f: Finding): string {
  switch (f.kind) {
    case "u1a":
      return renderU1a(f);
    case "u1b":
      return renderU1b(f);
    case "u2":
      return renderU2(f);
    case "u3":
      return renderU3(f);
    case "u4":
      return renderU4(f);
    case "u5":
      return renderU5(f);
    case "u6":
      return renderU6(f);
    case "u7":
      return renderU7(f);
    case "u8":
      return renderU8(f);
    case "u9.muscle":
      return renderU9Muscle(f);
    case "u9.tmj":
      return renderU9Tmj(f);
    case "u9.refused":
      return renderU9Refused(f);
    case "u10":
      return renderU10(f);
    case "u10.refused":
      return renderU10Refused(f);
  }
}

// ============================================================================
// U1a — Schmerzlokalisation letzte 30 Tage
// ============================================================================

/**
 * Rules §U1a: primary structures listed directly; auxiliary (otherMast, nonMast)
 * appended in parentheses at the end. Full labels ("Andere Kaumuskeln" / "Nicht-Kaumuskeln")
 * — not the REGIONS abbreviations — per rules example.
 */
const U1A_PRIMARY_LABELS: Record<"temporalis" | "masseter" | "tmj", string> = {
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "Kiefergelenk",
};

const U1A_AUX_LABELS: Record<"otherMast" | "nonMast", string> = {
  otherMast: "Andere Kaumuskeln",
  nonMast: "Nicht-Kaumuskeln",
};

function renderU1a(f: U1aFinding): string {
  const primary = f.primary
    .map((s) => `${U1A_PRIMARY_LABELS[s.region]} ${sideAdv(s.side)}`)
    .join(", ");
  const auxiliary = f.auxiliary
    .map((s) => `${U1A_AUX_LABELS[s.region]} ${sideAdv(s.side)}`)
    .join(", ");

  let body: string;
  if (primary && auxiliary) body = `${primary} (${auxiliary})`;
  else if (primary) body = primary;
  else body = auxiliary;

  return `Schmerzlokalisation letzte 30 Tage bestätigt in ${body}.`;
}

// ============================================================================
// U1b — Kopfschmerzlokalisation letzte 30 Tage
// ============================================================================

const U1B_LABELS: Record<HeadacheLocation, string> = {
  temporalis: "Temporalis",
  other: "andere Lokalisation",
};

function renderU1b(f: U1bFinding): string {
  const body = f.locations.map((l) => `${U1B_LABELS[l.location]} ${sideAdv(l.side)}`).join(", ");
  return `Kopfschmerzlokalisation letzte 30 Tage bestätigt in ${body}.`;
}

// ============================================================================
// U2 — Schneidekantenverhältnisse
// ============================================================================

/**
 * Produces one measurement sentence plus an optional trailing "Referenzzahn: …"
 * sentence when a non-standard tooth was used (rules §U2: "Referenzzahn nur
 * nennen, wenn nicht 11/21").
 */
function renderU2(f: U2Finding): string {
  const parts: string[] = [];
  if (f.horizontalOverjet !== null) parts.push(`Horizontaler Überbiss ${f.horizontalOverjet} mm`);
  if (f.verticalOverlap !== null) parts.push(`vertikaler Überbiss ${f.verticalOverlap} mm`);
  if (f.midline && f.midline !== "na") {
    const dir = f.midline.direction === "right" ? "rechts" : "links";
    parts.push(`Mittellinienabweichung ${f.midline.mm} mm nach ${dir}`);
  }

  const sentences: string[] = [];
  if (parts.length > 0) sentences.push(parts.join(", ") + ".");
  if (f.referenceTooth !== null) sentences.push(`Referenzzahn: ${f.referenceTooth}.`);
  return sentences.join(" ");
}

// ============================================================================
// U3 — Öffnungs-/Schließmuster
// ============================================================================

function renderU3(f: U3Finding): string {
  return `Öffnungs-/Schließmuster: ${E3_OPENING_PATTERNS[f.pattern]}.`;
}

// ============================================================================
// U4 — Öffnungs-/Schließbewegungen
// ============================================================================

/**
 * Produces up to two sentences:
 *   "Schmerzfreie Mundöffnung X mm." | "Schmerzfreie Mundöffnung verweigert."
 *   "Maximale Mundöffnung Y mm[, mit bekannten Schmerzen in …][, mit bekanntem Schläfenkopfschmerz]
 *    [, Schmerzabfrage verweigert][, Untersuchung vom Patienten abgebrochen]."
 *   | "Maximale Mundöffnung verweigert."
 *
 * Qualifier clauses only appear on the "Maximale Mundöffnung" measurement sentence.
 */
function renderU4(f: U4Finding): string {
  const sentences: string[] = [];

  if (f.painFreeRefused) {
    sentences.push("Schmerzfreie Mundöffnung verweigert.");
  } else if (f.painFreeMm !== null) {
    sentences.push(`Schmerzfreie Mundöffnung ${f.painFreeMm} mm.`);
  }

  if (f.maxRefused) {
    sentences.push("Maximale Mundöffnung verweigert.");
  } else if (f.maxMm !== null) {
    const parts = [`Maximale Mundöffnung ${f.maxMm} mm`];
    if (f.painStructures.length > 0) {
      parts.push(`mit bekannten Schmerzen in ${renderStructureList(f.painStructures)}`);
    }
    if (f.withHeadache) parts.push("mit bekanntem Schläfenkopfschmerz");
    if (f.interviewRefused) parts.push("Schmerzabfrage verweigert");
    if (f.assistedTerminated) parts.push("Untersuchung vom Patienten abgebrochen");
    sentences.push(parts.join(", ") + ".");
  } else if (f.painStructures.length > 0 || f.withHeadache || f.interviewRefused || f.assistedTerminated) {
    // No measurement but qualifier/meta signals exist. Surface as a neutral clause.
    const parts: string[] = [];
    if (f.painStructures.length > 0) {
      parts.push(`Bekannte Schmerzen bei Mundöffnung in ${renderStructureList(f.painStructures)}`);
    }
    if (f.withHeadache) parts.push("bekannter Schläfenkopfschmerz bei Mundöffnung");
    if (f.interviewRefused) parts.push("Schmerzabfrage verweigert");
    if (f.assistedTerminated) parts.push("Untersuchung vom Patienten abgebrochen");
    sentences.push(parts.join(", ") + ".");
  }

  return sentences.join(" ");
}

// ============================================================================
// U5 — Laterotrusion/Protrusion
// ============================================================================

function renderU5(f: U5Finding): string {
  const measurements: string[] = [];
  pushMovementSlot(measurements, "Laterotrusion rechts", f.lateralRightMm, f.lateralRightRefused);
  pushMovementSlot(measurements, "Laterotrusion links", f.lateralLeftMm, f.lateralLeftRefused);
  pushMovementSlot(measurements, "Protrusion", f.protrusiveMm, f.protrusiveRefused);

  const parts = [...measurements];
  if (f.painStructures.length > 0) {
    parts.push(`mit bekannten Schmerzen in ${renderStructureList(f.painStructures)}`);
  }
  if (f.interviewRefused) parts.push("Schmerzabfrage verweigert");

  if (parts.length === 0) return "";
  return parts.join(", ") + ".";
}

function pushMovementSlot(
  out: string[],
  label: string,
  mm: number | null,
  refused: boolean
): void {
  if (refused) out.push(`${label} verweigert`);
  else if (mm !== null) out.push(`${label} ${mm} mm`);
}

// ============================================================================
// Shared: pain-structure list ("Temporalis rechts, Masseter beidseits")
// ============================================================================

function renderStructureList(structures: Array<{ region: Region; side: SideOrBoth }>): string {
  return structures.map((s) => `${REGIONS[s.region]} ${sideAdv(s.side)}`).join(", ");
}

// ============================================================================
// U6 — Gelenkgeräusche bei Öffnung/Schließung
// ============================================================================

function renderU6(f: U6Finding): string {
  const phenomenon = f.sound === "click" ? "Knacken" : "Reiben";
  const location = tmjLocation(f.side);
  const movement = renderMovementOpenClose(f.movements);
  const sources = renderSources(f.movements.length > 0, f.patient);
  const parts = [`${phenomenon} ${location}`];
  if (movement) parts[0] += ` ${movement}`;
  if (sources) parts.push(sources);
  if (f.sound === "click" && f.familiarPain !== null) {
    parts.push(f.familiarPain ? "mit bekanntem Schmerz" : "ohne bekanntem Schmerz");
  }
  return parts.join(", ") + ".";
}

function renderMovementOpenClose(movements: Array<"open" | "close">): string {
  const open = movements.includes("open");
  const close = movements.includes("close");
  if (open && close) return "beim Öffnen und Schließen";
  if (open) return "beim Öffnen";
  if (close) return "beim Schließen";
  return "";
}

// ============================================================================
// U7 — Gelenkgeräusche bei Laterotrusion/Protrusion
// ============================================================================

function renderU7(f: U7Finding): string {
  const phenomenon = f.sound === "click" ? "Knacken" : "Reiben";
  const location = tmjLocation(f.side);
  const movement = "bei Laterotrusion und Protrusion";
  const sources = renderSources(f.examiner, f.patient);
  const parts = [`${phenomenon} ${location} ${movement}`];
  if (sources) parts.push(sources);
  if (f.sound === "click" && f.familiarPain !== null) {
    parts.push(f.familiarPain ? "mit bekanntem Schmerz" : "ohne bekanntem Schmerz");
  }
  return parts.join(", ") + ".";
}

// ============================================================================
// U9 — Palpation Muskeln & Kiefergelenk
// ============================================================================

function renderU9Muscle(f: U9MuscleFinding): string {
  const sideLabel = sideAdv(f.side);

  // Template dispatch (rules §U9):
  // - Temporalis + pain + headache → combined ("Bekannter Schmerz und bekannter Kopfschmerz bei Palpation des Temporalis …")
  // - Temporalis + headache only   → reiner Kopfschmerz-Befund ("Bekannter Kopfschmerz bei Palpation des Temporalis …")
  // - Temporalis + pain only OR Masseter + pain → muscle template ("Bekannter Schmerz bei Palpation in [Muskel] …")
  if (f.muscle === "temporalis" && f.triggeredByHeadache && !f.triggeredByPain) {
    return `Bekannter Kopfschmerz bei Palpation des Temporalis ${sideLabel}.`;
  }

  const muscleLabel = f.muscle === "temporalis" ? "Temporalis" : "Masseter";
  const phenomenonAndLoc =
    f.muscle === "temporalis" && f.triggeredByHeadache
      ? `Bekannter Schmerz und bekannter Kopfschmerz bei Palpation des ${muscleLabel} ${sideLabel}`
      : `Bekannter Schmerz bei Palpation in ${muscleLabel} ${sideLabel}`;

  const qualifiers = [
    renderPainQualifier("Übertragung", f.referred),
    renderPainQualifier("Ausbreitung", f.spreading),
  ].filter((q): q is string => q !== null);

  const parts = [phenomenonAndLoc, ...qualifiers];
  return parts.join(", ") + ".";
}

function renderU9Tmj(f: U9TmjFinding): string {
  const parts = [`Bekannter Schmerz bei Palpation ${tmjLocationU9(f.side)}`];
  const q = renderPainQualifier("Übertragung", f.referred);
  if (q) parts.push(q);
  return parts.join(", ") + ".";
}

function renderU9Refused(f: U9RefusedFinding): string {
  return `Palpation ${sideAdv(f.side)} verweigert.`;
}

/**
 * TMJ location in U9 uses the same helper as U6/U7 (→ "im Kiefergelenk (beidseitig)"),
 * rather than the rules-doc literal "im Kiefergelenk beidseits", per UX feedback
 * that the parenthetical reads more naturally.
 */
function tmjLocationU9(side: SideOrBoth): string {
  return tmjLocation(side);
}

/**
 * Renders a mit/ohne pain-direction qualifier.
 *   true  → "mit {label}"
 *   false → "ohne {label}"
 *   null  → null (caller omits the clause — rule 1.5 "null entfällt")
 */
function renderPainQualifier(label: string, value: boolean | null): string | null {
  if (value === null) return null;
  return value ? `mit ${label}` : `ohne ${label}`;
}

// ============================================================================
// U8 — Kieferklemme/Sperre
// ============================================================================

const U8_SITUATION_LABELS: Record<U8Finding["situation"], string> = {
  duringOpening: "während der Öffnung",
  wideOpening: "bei weiter Mundöffnung",
};

const U8_REDUCIBILITY_LABELS: Record<Exclude<U8Finding["reducibility"], null>, string> = {
  byPatient: "lösbar durch Patient",
  byExaminer: "lösbar durch Untersucher",
  byBoth: "lösbar durch Patient und Untersucher",
  none: "nicht lösbar",
};

function renderU8(f: U8Finding): string {
  const parts = [
    `Kieferblockade ${U8_SITUATION_LABELS[f.situation]} ${tmjLocation(f.side)}`,
  ];
  if (f.reducibility !== null) parts.push(U8_REDUCIBILITY_LABELS[f.reducibility]);
  return parts.join(", ") + ".";
}

// ============================================================================
// U10 — Ergänzende Palpation
// ============================================================================

/**
 * Labels per rules §U10 (which cites "Regio submandibularis, Pterygoideus
 * lateralis, Temporalis-Sehne" as the example vocabulary). Distinct from the
 * short UI labels in PALPATION_SITES.
 */
const U10_SITE_LABELS: Record<U10Finding["site"], string> = {
  posteriorMandibular: "Regio retromandibularis",
  submandibular: "Regio submandibularis",
  lateralPterygoid: "Pterygoideus lateralis",
  temporalisTendon: "Temporalis-Sehne",
};

function renderU10(f: U10Finding): string {
  const parts = [
    `Bekannter Schmerz bei Palpation in ${U10_SITE_LABELS[f.site]} ${sideAdv(f.side)}`,
  ];
  const q = renderPainQualifier("Übertragung", f.referred);
  if (q) parts.push(q);
  return parts.join(", ") + ".";
}

function renderU10Refused(f: U10RefusedFinding): string {
  return `Ergänzende Palpation ${sideAdv(f.side)} verweigert.`;
}

// ============================================================================
// Shared: sources qualifier (Untersucher / Patient)
// ============================================================================

/**
 * Renders the "Quellen" qualifier — always explicit, including negations
 * (rule 1.5: qualifiers are fully ausformuliert when parent phenomenon is positive).
 *
 * Returns empty string when both are false (invariant: caller should have dropped the finding).
 */
function renderSources(examiner: boolean, patient: boolean): string {
  if (examiner && patient) return "vom Untersucher und Patient festgestellt";
  if (examiner && !patient) return "vom Untersucher festgestellt, vom Patient nicht bemerkt";
  if (!examiner && patient) return "vom Patient bemerkt, vom Untersucher nicht festgestellt";
  return "";
}
