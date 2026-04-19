import { SITES_BY_GROUP, getValueAtPath, type PalpationSite } from "@cmdetect/dc-tmd";
import type { U9MuscleFinding, U9TmjFinding } from "../types";

/** Rule 1.3: within a section, right-first before left before bilateral merges. */
const SIDES_RIGHT_FIRST = ["right", "left"] as const;

type Side = "left" | "right";

/**
 * U9 — Palpation Muskeln & Kiefergelenk.
 *
 * Aggregation auf Muskelgruppen-Ebene (Regel 1.8, OR-Logik):
 * - Temporalis: OR über drei Subpunkte (anterior/media/posterior)
 * - Masseter:   OR über drei Subpunkte (Ursprung/Körper/Ansatz)
 * - Kiefergelenk: OR über zwei Subpunkte (lateraler Pol / um den lat. Pol)
 *
 * Zwei unabhängige Trigger (Regel 1.6):
 * - `familiarPain` (bekannter_schmerz) an irgendeinem Subpunkt → triggeredByPain
 * - `familiarHeadache` an einem Temporalis-Subpunkt → triggeredByHeadache
 *
 * Qualifier (referred, spreading) sind an bekannter_schmerz gebunden (Regel 1.6):
 * - Nur OR über Subpunkte, an denen `familiarPain: yes` ist.
 * - Wenn kein Subpunkt familiarPain-positiv hat (reiner Kopfschmerz-Fall), Qualifier = null.
 * - Wenn Feld nicht abgefragt (Palpationsmodus basic, oder site.hasSpreading=false) → null.
 */
export function extractU9(data: unknown): Array<U9MuscleFinding | U9TmjFinding> {
  const findings: Array<U9MuscleFinding | U9TmjFinding> = [];

  for (const side of SIDES_RIGHT_FIRST) {
    if (getValueAtPath(data, `e9.${side}.refused`) === true) continue;

    const temporalis = extractMuscle(data, side, "temporalis");
    if (temporalis) findings.push(temporalis);

    const masseter = extractMuscle(data, side, "masseter");
    if (masseter) findings.push(masseter);

    const tmj = extractTmj(data, side);
    if (tmj) findings.push(tmj);
  }

  return findings;
}

function extractMuscle(
  data: unknown,
  side: Side,
  muscle: "temporalis" | "masseter"
): U9MuscleFinding | null {
  const sites = SITES_BY_GROUP[muscle];

  const painPositiveSites: PalpationSite[] = [];
  let triggeredByHeadache = false;

  for (const site of sites) {
    if (yes(getValueAtPath(data, `e9.${side}.${site}.familiarPain`))) {
      painPositiveSites.push(site);
    }
    if (muscle === "temporalis") {
      if (yes(getValueAtPath(data, `e9.${side}.${site}.familiarHeadache`))) {
        triggeredByHeadache = true;
      }
    }
  }

  const triggeredByPain = painPositiveSites.length > 0;
  if (!triggeredByPain && !triggeredByHeadache) return null;

  // Qualifier OR across pain-positive sub-sites only (rule 1.6).
  // null when no pain-positive sub-site exists (headache-only), OR when every pain-positive
  // sub-site reports the qualifier as unasked (palpation mode = basic, or hasSpreading=false).
  const referred = orQualifierAcrossSites(data, side, painPositiveSites, "referredPain");
  const spreading = orQualifierAcrossSites(data, side, painPositiveSites, "spreadingPain");

  return {
    kind: "u9.muscle",
    muscle,
    side,
    triggeredByPain,
    triggeredByHeadache,
    referred,
    spreading,
  };
}

function extractTmj(data: unknown, side: Side): U9TmjFinding | null {
  const sites = SITES_BY_GROUP.tmj;
  const painPositiveSites: PalpationSite[] = sites.filter((site) =>
    yes(getValueAtPath(data, `e9.${side}.${site}.familiarPain`))
  );
  if (painPositiveSites.length === 0) return null;

  return {
    kind: "u9.tmj",
    side,
    referred: orQualifierAcrossSites(data, side, painPositiveSites, "referredPain"),
  };
}

/**
 * OR across the given (pain-positive) sub-sites for a yes/no qualifier field.
 * Returns:
 *   true  — at least one site has the qualifier = "yes"
 *   false — every site asked it and every one answered "no"
 *   null  — no site had it asked (field absent everywhere, e.g. palpation mode = basic)
 */
function orQualifierAcrossSites(
  data: unknown,
  side: Side,
  sites: readonly PalpationSite[],
  field: "referredPain" | "spreadingPain"
): boolean | null {
  let anyAsked = false;
  let anyYes = false;
  for (const site of sites) {
    const v = getValueAtPath(data, `e9.${side}.${site}.${field}`);
    if (v === "yes") {
      anyYes = true;
      anyAsked = true;
    } else if (v === "no") {
      anyAsked = true;
    }
  }
  if (!anyAsked) return null;
  return anyYes;
}

function yes(v: unknown): boolean {
  return v === "yes";
}
