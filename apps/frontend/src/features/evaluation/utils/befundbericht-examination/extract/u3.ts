import { getValueAtPath } from "@cmdetect/dc-tmd";
import type { U3Finding } from "../types";

/**
 * U3 — Öffnungs-/Schließmuster.
 *
 * Template per rules §U3:
 *   "Öffnungs-/Schließmuster: [Wert]."
 * Nur berichten, wenn Wert nicht "Gerade" (straight).
 */
export function extractU3(data: unknown): U3Finding[] {
  const pattern = getValueAtPath(data, "e3.openingPattern");
  if (
    pattern !== "correctedDeviation" &&
    pattern !== "uncorrectedRight" &&
    pattern !== "uncorrectedLeft"
  ) {
    return [];
  }
  return [{ kind: "u3", pattern }];
}
