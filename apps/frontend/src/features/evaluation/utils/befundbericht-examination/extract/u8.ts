import { getValueAtPath } from "@cmdetect/dc-tmd";
import type { U8Finding } from "../types";

/** Rule 1.3: within a section, right-first before left before bilateral merges. */
const SIDES_RIGHT_FIRST = ["right", "left"] as const;

type LockingType = "closedLocking" | "openLocking";

const LOCKING_TO_SITUATION: Record<LockingType, U8Finding["situation"]> = {
  closedLocking: "duringOpening",
  openLocking: "wideOpening",
};

/**
 * U8 — Kieferklemme/Sperre.
 *
 * Pro Situation (closedLocking="während der Öffnung" / openLocking="bei weiter
 * Mundöffnung") und pro Seite ein Finding, sobald `locking === "yes"`.
 * Bilaterales Mergen passiert in der Pipeline-Stufe danach (Regel 1.7).
 *
 * Reducibility-Qualifier (byPatient/byExaminer) sind per enableWhen an
 * `locking === "yes"` gekoppelt. Both-yes → "byBoth" (Patient und Untersucher).
 * Both-no → "none" ("nicht lösbar"). Gemischte null/yes-Zustände werden als
 * entsprechender einzelner Wert interpretiert; beide null → null (Klausel entfällt).
 */
export function extractU8(data: unknown): U8Finding[] {
  const findings: U8Finding[] = [];
  const lockingTypes: LockingType[] = ["closedLocking", "openLocking"];

  for (const lt of lockingTypes) {
    for (const side of SIDES_RIGHT_FIRST) {
      if (getValueAtPath(data, `e8.${side}.${lt}.locking`) !== "yes") continue;

      const byPatient = getValueAtPath(data, `e8.${side}.${lt}.reducibleByPatient`);
      const byExaminer = getValueAtPath(data, `e8.${side}.${lt}.reducibleByExaminer`);

      findings.push({
        kind: "u8",
        situation: LOCKING_TO_SITUATION[lt],
        side,
        reducibility: resolveReducibility(byPatient, byExaminer),
      });
    }
  }

  return findings;
}

function resolveReducibility(byPatient: unknown, byExaminer: unknown): U8Finding["reducibility"] {
  const p = byPatient === "yes" ? true : byPatient === "no" ? false : null;
  const e = byExaminer === "yes" ? true : byExaminer === "no" ? false : null;

  if (p === true && e === true) return "byBoth";
  if (p === true) return "byPatient";
  if (e === true) return "byExaminer";
  if (p === false && e === false) return "none";
  return null;
}
