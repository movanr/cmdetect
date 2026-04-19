import type { Finding, U6Finding, U7Finding } from "./types";
import { tmjLocation } from "./labels";

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
