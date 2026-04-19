import { SIDE_KEYS, getValueAtPath } from "@cmdetect/dc-tmd";
import type { HeadacheLocation, U1bFinding } from "../types";

const HEADACHE_LOCATIONS: readonly HeadacheLocation[] = ["temporalis", "other"];

/**
 * U1b — Kopfschmerzlokalisation letzte 30 Tage.
 *
 * Template: "Kopfschmerzlokalisation letzte 30 Tage bestätigt in [Struktur] [Seite], …"
 *
 * Data model: `e1.headacheLocation.{side}: string[]` containing HeadacheLocation keys
 * (temporalis, other; possibly "none").
 */
export function extractU1b(data: unknown): U1bFinding[] {
  const sides: { left: Set<string>; right: Set<string> } = {
    left: new Set(),
    right: new Set(),
  };
  for (const side of SIDE_KEYS) {
    const raw = getValueAtPath(data, `e1.headacheLocation.${side}`);
    if (!Array.isArray(raw)) continue;
    for (const v of raw) {
      if (typeof v === "string" && v !== "none") sides[side].add(v);
    }
  }

  const locations: U1bFinding["locations"] = [];
  for (const loc of HEADACHE_LOCATIONS) {
    const onRight = sides.right.has(loc);
    const onLeft = sides.left.has(loc);
    if (onRight && onLeft) locations.push({ location: loc, side: "both" });
    else if (onRight) locations.push({ location: loc, side: "right" });
    else if (onLeft) locations.push({ location: loc, side: "left" });
  }

  if (locations.length === 0) return [];
  return [{ kind: "u1b", locations }];
}
