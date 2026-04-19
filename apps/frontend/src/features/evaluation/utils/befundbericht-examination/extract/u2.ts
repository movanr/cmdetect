import { getValueAtPath } from "@cmdetect/dc-tmd";
import type { U2Finding } from "../types";

/**
 * U2 — Schneidekantenverhältnisse.
 *
 * Template per rules §U2:
 *   "Horizontaler Überbiss X mm, vertikaler Überbiss Y mm, Mittellinienabweichung Z mm nach [Richtung]."
 * - Messwerte immer berichten, wenn vorhanden.
 * - Referenzzahn nur nennen, wenn nicht 11/21.
 *
 * Data model (e2):
 * - e2.referenceTooth.selection: "tooth11" | "tooth21" | "other"
 * - e2.referenceTooth.otherTooth: string (only when selection === "other")
 * - e2.horizontalOverjet: number
 * - e2.verticalOverlap: number
 * - e2.midlineDeviation.direction: "right" | "left" | "na"
 * - e2.midlineDeviation.mm: number (only when direction !== "na")
 */
export function extractU2(data: unknown): U2Finding[] {
  const horizontalOverjet = num(getValueAtPath(data, "e2.horizontalOverjet"));
  const verticalOverlap = num(getValueAtPath(data, "e2.verticalOverlap"));

  const direction = getValueAtPath(data, "e2.midlineDeviation.direction");
  let midline: U2Finding["midline"];
  if (direction === "right" || direction === "left") {
    const mm = num(getValueAtPath(data, "e2.midlineDeviation.mm"));
    midline = mm !== null ? { mm, direction } : null;
  } else if (direction === "na") {
    midline = "na";
  } else {
    midline = null;
  }

  const referenceTooth = resolveReferenceTooth(data);

  const hasContent =
    horizontalOverjet !== null ||
    verticalOverlap !== null ||
    midline !== null ||
    referenceTooth !== null;
  if (!hasContent) return [];

  return [
    {
      kind: "u2",
      horizontalOverjet,
      verticalOverlap,
      midline,
      referenceTooth,
    },
  ];
}

/** Returns null for the default teeth (11/21); "Zahn NN" string for custom reference tooth. */
function resolveReferenceTooth(data: unknown): string | null {
  const selection = getValueAtPath(data, "e2.referenceTooth.selection");
  if (selection !== "other") return null;
  const otherTooth = getValueAtPath(data, "e2.referenceTooth.otherTooth");
  if (typeof otherTooth !== "string" || otherTooth.trim() === "") return null;
  return `Zahn ${otherTooth.trim()}`;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
