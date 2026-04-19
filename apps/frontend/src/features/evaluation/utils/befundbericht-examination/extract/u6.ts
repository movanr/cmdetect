import { SIDE_KEYS, getValueAtPath } from "@cmdetect/dc-tmd";
import type { U6Finding } from "../types";

/**
 * U6 — Gelenkgeräusche bei Öffnung/Schließung.
 *
 * Per side × sound: emit one Finding when any positive signal exists
 * (examiner detection during opening or closing, OR patient-reported sound).
 *
 * Dimensions (rule 1.5, nur positiv erwähnt): Seite, Bewegung.
 *   - movements only populated from examiner-positive fields.
 *   - side emitted as left/right; bilateral merge runs in a later stage.
 * Qualifiers (rule 1.5, auch verneint ausformuliert): Quellen, Schmerz (click only).
 *   - Sources explicit including negation (patient=no → rendered as "nicht bemerkt").
 *   - familiarPain rendered mit/ohne when non-null; null = not asked (patient=no).
 */
export function extractU6(data: unknown): U6Finding[] {
  const findings: U6Finding[] = [];
  for (const side of SIDE_KEYS) {
    const click = extractSide(data, side, "click");
    if (click) findings.push(click);
    const crepitus = extractSide(data, side, "crepitus");
    if (crepitus) findings.push(crepitus);
  }
  return findings;
}

function extractSide(
  data: unknown,
  side: "left" | "right",
  sound: "click" | "crepitus"
): U6Finding | null {
  const prefix = `e6.${side}.${sound}`;
  const examinerOpen = yes(getValueAtPath(data, `${prefix}.examinerOpen`));
  const examinerClose = yes(getValueAtPath(data, `${prefix}.examinerClose`));
  const patient = yes(getValueAtPath(data, `${prefix}.patient`));

  if (!examinerOpen && !examinerClose && !patient) return null;

  const movements: Array<"open" | "close"> = [];
  if (examinerOpen) movements.push("open");
  if (examinerClose) movements.push("close");

  let familiarPain: boolean | null = null;
  if (sound === "click") {
    // painWithClick is only asked when patient === yes; familiarPain only when painWithClick === yes.
    // Rule 1.6 / §U6 note: schmerzhaftes_knacken allein (ohne bekannter_schmerz) ist nicht berichtenswert.
    const fp = getValueAtPath(data, `${prefix}.familiarPain`);
    if (fp === "yes") familiarPain = true;
    else if (fp === "no") familiarPain = false;
    // else: null (gated off by patient=no or painWithClick=no → not asked)
  }

  return {
    kind: "u6",
    sound,
    side,
    movements,
    patient,
    familiarPain,
  };
}

function yes(v: unknown): boolean {
  return v === "yes";
}
