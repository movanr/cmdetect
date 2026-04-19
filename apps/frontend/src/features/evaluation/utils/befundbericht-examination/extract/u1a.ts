import { SIDE_KEYS, getValueAtPath, type Region } from "@cmdetect/dc-tmd";
import type { U1aFinding } from "../types";

type PrimaryRegion = Exclude<Region, "otherMast" | "nonMast">;
type AuxiliaryRegion = Extract<Region, "otherMast" | "nonMast">;

const PRIMARY_REGIONS: readonly PrimaryRegion[] = ["temporalis", "masseter", "tmj"];
const AUXILIARY_REGIONS: readonly AuxiliaryRegion[] = ["otherMast", "nonMast"];

/**
 * U1a — Schmerzlokalisation letzte 30 Tage.
 *
 * Template: "Schmerzlokalisation letzte 30 Tage bestätigt in [Struktur] [Seite], …"
 * Auxiliary regions (otherMast, nonMast) appended in parentheses per rules §U1a.
 *
 * Data model: `e1.painLocation.{side}: string[]` containing region keys (possibly "none").
 */
export function extractU1a(data: unknown): U1aFinding[] {
  const primary = collectStructures(data, PRIMARY_REGIONS);
  const auxiliary = collectStructures(data, AUXILIARY_REGIONS);

  if (primary.length === 0 && auxiliary.length === 0) return [];

  return [{ kind: "u1a", primary, auxiliary }];
}

function collectStructures<R extends Region>(
  data: unknown,
  regions: readonly R[]
): Array<{ region: R; side: "left" | "right" | "both" }> {
  const out: Array<{ region: R; side: "left" | "right" | "both" }> = [];
  const sets = readSides(data, "e1.painLocation");

  for (const region of regions) {
    const onRight = sets.right.has(region);
    const onLeft = sets.left.has(region);
    if (onRight && onLeft) out.push({ region, side: "both" });
    else if (onRight) out.push({ region, side: "right" });
    else if (onLeft) out.push({ region, side: "left" });
  }

  return out;
}

function readSides(data: unknown, basePath: string): { left: Set<string>; right: Set<string> } {
  const sides: { left: Set<string>; right: Set<string> } = {
    left: new Set(),
    right: new Set(),
  };
  for (const side of SIDE_KEYS) {
    const raw = getValueAtPath(data, `${basePath}.${side}`);
    if (!Array.isArray(raw)) continue;
    for (const v of raw) {
      if (typeof v === "string" && v !== "none") sides[side].add(v);
    }
  }
  return sides;
}
