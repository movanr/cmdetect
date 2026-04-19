import { getValueAtPath } from "@cmdetect/dc-tmd";
import type { U4Finding } from "../types";
import { anyFamiliarHeadacheAtTemporalis, unionFamiliarPainStructures } from "./shared-pain-union";

/**
 * U4 — Öffnungs-/Schließbewegungen.
 *
 * Template per rules §U4 plus refused/terminated overlays:
 *   "Schmerzfreie Mundöffnung X mm." | "Schmerzfreie Mundöffnung verweigert."
 *   "Maximale Mundöffnung Y mm [, mit bekannten Schmerzen in …]
 *    [, mit bekanntem Schläfenkopfschmerz]
 *    [, Schmerzabfrage verweigert]
 *    [, Untersuchung vom Patienten abgebrochen]."
 *   (or "Maximale Mundöffnung verweigert." if both sub-measurements refused)
 *
 * - maxMm = max(maxUnassisted.measurement, maxAssisted.measurement), ignoring refused slots.
 * - maxRefused = both maxUnassisted AND maxAssisted refused.
 * - assistedTerminated = hand raised during passive measurement (U4c terminated).
 * - interviewRefused = at least one pain interview (maxUnassisted or maxAssisted) refused.
 */
export function extractU4(data: unknown): U4Finding[] {
  const painFreeMm = num(getValueAtPath(data, "e4.painFree.measurement"));
  const painFreeRefused = getValueAtPath(data, "e4.painFree.refused") === true;

  const unassistedRefused = getValueAtPath(data, "e4.maxUnassisted.refused") === true;
  const assistedRefused = getValueAtPath(data, "e4.maxAssisted.refused") === true;
  const unassistedMm = unassistedRefused
    ? null
    : num(getValueAtPath(data, "e4.maxUnassisted.measurement"));
  const assistedMm = assistedRefused
    ? null
    : num(getValueAtPath(data, "e4.maxAssisted.measurement"));
  const maxMm = maxOrNull(unassistedMm, assistedMm);
  const maxRefused = unassistedRefused && assistedRefused;

  const assistedTerminated = getValueAtPath(data, "e4.maxAssisted.terminated") === true;
  const interviewRefused =
    getValueAtPath(data, "e4.maxUnassisted.interviewRefused") === true ||
    getValueAtPath(data, "e4.maxAssisted.interviewRefused") === true;

  const painPrefixes = ["e4.maxUnassisted", "e4.maxAssisted"];
  const painStructures = unionFamiliarPainStructures(data, painPrefixes);
  const withHeadache = anyFamiliarHeadacheAtTemporalis(data, painPrefixes);

  const hasContent =
    painFreeMm !== null ||
    painFreeRefused ||
    maxMm !== null ||
    maxRefused ||
    assistedTerminated ||
    interviewRefused ||
    painStructures.length > 0 ||
    withHeadache;
  if (!hasContent) return [];

  return [
    {
      kind: "u4",
      painFreeMm,
      painFreeRefused,
      maxMm,
      maxRefused,
      painStructures,
      withHeadache,
      assistedTerminated,
      interviewRefused,
    },
  ];
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function maxOrNull(a: number | null, b: number | null): number | null {
  if (a === null && b === null) return null;
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}
