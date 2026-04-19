import { E10_SITE_KEYS, SIDE_KEYS, getValueAtPath } from "@cmdetect/dc-tmd";
import type { U10Finding } from "../types";

type Site = U10Finding["site"];

/**
 * U10 — Ergänzende Muskelschmerzen bei Palpation.
 *
 * Per rules §U9/U10: template analogous to the muscle template, without the
 * "Ausbreitung" qualifier (field does not exist). Unlike U9, the four U10
 * sites are rendered individually (no muscle-group OR aggregation).
 *
 * Trigger: `familiarPain === "yes"` at a site (bare pain=yes without
 * familiarPain is ignored per rule 1.6).
 *
 * Emits one Finding per positive site × side. Bilateral merging happens in a
 * later stage (rule 1.7).
 */
export function extractU10(data: unknown): U10Finding[] {
  const findings: U10Finding[] = [];

  for (const site of E10_SITE_KEYS as readonly Site[]) {
    for (const side of SIDE_KEYS) {
      if (getValueAtPath(data, `e10.${side}.refused`) === true) continue;
      if (getValueAtPath(data, `e10.${side}.${site}.familiarPain`) !== "yes") continue;

      const referredRaw = getValueAtPath(data, `e10.${side}.${site}.referredPain`);
      const referred =
        referredRaw === "yes" ? true : referredRaw === "no" ? false : null;

      findings.push({ kind: "u10", site, side, referred });
    }
  }

  return findings;
}
