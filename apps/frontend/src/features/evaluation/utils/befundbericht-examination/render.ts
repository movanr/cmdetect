import type {
  Finding,
  SideOrBoth,
  U6Finding,
  U7Finding,
  U9MuscleFinding,
  U9TmjFinding,
} from "./types";
import { sideAdv, tmjLocation } from "./labels";

/**
 * Renders a single Finding as one complete German sentence (ends with period).
 * Follows meta-rule 1.1: [Phänomen] + [Lokalisation] + [Bewegung] + [Quellen] + [Qualifikatoren].
 */
export function renderSentence(f: Finding): string {
  switch (f.kind) {
    case "u6":
      return renderU6(f);
    case "u7":
      return renderU7(f);
    case "u9.muscle":
      return renderU9Muscle(f);
    case "u9.tmj":
      return renderU9Tmj(f);
    default:
      // Other section renderers arrive in subsequent slices.
      throw new Error(`renderSentence: unsupported finding kind "${f.kind}"`);
  }
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
