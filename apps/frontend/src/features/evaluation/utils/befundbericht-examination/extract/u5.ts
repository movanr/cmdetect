import { getValueAtPath } from "@cmdetect/dc-tmd";
import type { U5Finding } from "../types";
import { unionFamiliarPainStructures } from "./shared-pain-union";

/**
 * U5 — Laterotrusion/Protrusion.
 *
 * Template per rules §U5:
 *   "Laterotrusion rechts X mm, Laterotrusion links Y mm, Protrusion Z mm
 *    [, mit bekannten Schmerzen in Struktur1, Struktur2]."
 *
 * - Measurements each reported individually when present.
 * - painStructures: union(familiarPain) across all three movements.
 * - No headache trigger (rule §U5 — only U4 has Schläfenkopfschmerz).
 */
export function extractU5(data: unknown): U5Finding[] {
  const lateralRightMm = num(getValueAtPath(data, "e5.lateralRight.measurement"));
  const lateralLeftMm = num(getValueAtPath(data, "e5.lateralLeft.measurement"));
  const protrusiveMm = num(getValueAtPath(data, "e5.protrusive.measurement"));

  const painStructures = unionFamiliarPainStructures(data, [
    "e5.lateralRight",
    "e5.lateralLeft",
    "e5.protrusive",
  ]);

  const hasContent =
    lateralRightMm !== null ||
    lateralLeftMm !== null ||
    protrusiveMm !== null ||
    painStructures.length > 0;
  if (!hasContent) return [];

  return [
    {
      kind: "u5",
      lateralRightMm,
      lateralLeftMm,
      protrusiveMm,
      painStructures,
    },
  ];
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
