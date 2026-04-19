import { getValueAtPath } from "@cmdetect/dc-tmd";
import type { U5Finding } from "../types";
import { unionFamiliarPainStructures } from "./shared-pain-union";

type Movement = "lateralRight" | "lateralLeft" | "protrusive";

/**
 * U5 — Laterotrusion/Protrusion.
 *
 * Template per rules §U5 plus per-movement refusal overlay:
 *   "Laterotrusion rechts X mm | verweigert, Laterotrusion links Y mm | verweigert,
 *    Protrusion Z mm | verweigert
 *    [, mit bekannten Schmerzen in …]
 *    [, Schmerzabfrage verweigert]."
 *
 * - Per movement: `refused === true` replaces the mm slot with "verweigert".
 * - interviewRefused = at least one movement's pain interview was refused.
 */
export function extractU5(data: unknown): U5Finding[] {
  const slots = readSlot(data);

  const painStructures = unionFamiliarPainStructures(data, [
    "e5.lateralRight",
    "e5.lateralLeft",
    "e5.protrusive",
  ]);
  const interviewRefused = (["lateralRight", "lateralLeft", "protrusive"] as Movement[]).some(
    (m) => getValueAtPath(data, `e5.${m}.interviewRefused`) === true
  );

  const hasContent =
    slots.lateralRight.mm !== null ||
    slots.lateralRight.refused ||
    slots.lateralLeft.mm !== null ||
    slots.lateralLeft.refused ||
    slots.protrusive.mm !== null ||
    slots.protrusive.refused ||
    painStructures.length > 0 ||
    interviewRefused;
  if (!hasContent) return [];

  return [
    {
      kind: "u5",
      lateralRightMm: slots.lateralRight.mm,
      lateralRightRefused: slots.lateralRight.refused,
      lateralLeftMm: slots.lateralLeft.mm,
      lateralLeftRefused: slots.lateralLeft.refused,
      protrusiveMm: slots.protrusive.mm,
      protrusiveRefused: slots.protrusive.refused,
      painStructures,
      interviewRefused,
    },
  ];
}

function readSlot(data: unknown): Record<Movement, { mm: number | null; refused: boolean }> {
  const out = {} as Record<Movement, { mm: number | null; refused: boolean }>;
  for (const m of ["lateralRight", "lateralLeft", "protrusive"] as Movement[]) {
    const refused = getValueAtPath(data, `e5.${m}.refused`) === true;
    const mm = refused ? null : num(getValueAtPath(data, `e5.${m}.measurement`));
    out[m] = { mm, refused };
  }
  return out;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
