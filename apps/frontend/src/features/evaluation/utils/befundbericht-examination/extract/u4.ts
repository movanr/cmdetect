import { getValueAtPath } from "@cmdetect/dc-tmd";
import type { U4Finding } from "../types";
import { anyFamiliarHeadacheAtTemporalis, unionFamiliarPainStructures } from "./shared-pain-union";

/**
 * U4 — Öffnungs-/Schließbewegungen.
 *
 * Template per rules §U4:
 *   "Schmerzfreie Mundöffnung X mm. Maximale Mundöffnung Y mm
 *    [, mit bekannten Schmerzen in Struktur1, Struktur2]
 *    [, mit bekanntem Schläfenkopfschmerz]."
 *
 * - painFreeMm: e4.painFree.measurement
 * - maxMm:      MAX(maxUnassisted.measurement, maxAssisted.measurement)
 * - painStructures: union(familiarPain) across maxUnassisted × maxAssisted
 *                   (painFree has no pain interview)
 * - withHeadache:   OR familiarHeadache at temporalis across maxUnassisted × maxAssisted
 *
 * Emits null when no measurements are present AND no pain/headache triggered.
 */
export function extractU4(data: unknown): U4Finding[] {
  const painFreeMm = num(getValueAtPath(data, "e4.painFree.measurement"));
  const unassistedMm = num(getValueAtPath(data, "e4.maxUnassisted.measurement"));
  const assistedMm = num(getValueAtPath(data, "e4.maxAssisted.measurement"));
  const maxMm = maxOrNull(unassistedMm, assistedMm);

  const painPrefixes = ["e4.maxUnassisted", "e4.maxAssisted"];
  const painStructures = unionFamiliarPainStructures(data, painPrefixes);
  const withHeadache = anyFamiliarHeadacheAtTemporalis(data, painPrefixes);

  const hasContent =
    painFreeMm !== null ||
    maxMm !== null ||
    painStructures.length > 0 ||
    withHeadache;
  if (!hasContent) return [];

  return [
    {
      kind: "u4",
      painFreeMm,
      maxMm,
      painStructures,
      withHeadache,
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
