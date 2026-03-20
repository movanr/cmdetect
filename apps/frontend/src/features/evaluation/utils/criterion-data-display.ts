/**
 * criterion-data-display — Flat source-data lookup for inline display.
 *
 * Maps DC/TMD source labels (SF1–SF14, U1–U10) to flat one-liner display
 * groups from criteriaData. Each group renders as: [badge] headline: value.
 */

import {
  PAIN_TYPES,
  PALPATION_SITES,
  REGIONS,
  SIDES,
  SITE_CONFIG,
  SITES_BY_GROUP,
  getValueAtPath as get,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import {
  SQ_DISPLAY_IDS,
  SQ_QUESTION_SHORT_LABELS,
  type SQQuestionId,
} from "@cmdetect/questionnaires";

// ── Types ─────────────────────────────────────────────────────────────

export interface DisplayGroup {
  badge: string;
  headline: string;
  value: string;
}

function translateValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (value === "yes" || value === true) return "Ja";
  if (value === "no" || value === false) return "Nein";
  if (value === "no_pain") return "Kein Schmerz";
  if (value === "intermittent") return "Kommen und gehen";
  if (value === "continuous") return "Dauerhaft";
  if (typeof value === "number") return `${value} mm`;
  return String(value);
}

// ── SQ reverse map: "SF4" → [SQ4_A, SQ4_B, SQ4_C, SQ4_D] ───────────

const SF_TO_SQ: Record<string, SQQuestionId[]> = {};
for (const [sqId, sfId] of Object.entries(SQ_DISPLAY_IDS)) {
  for (const key of [sfId, sfId.replace(/[a-z]$/, "")]) {
    if (!SF_TO_SQ[key]) SF_TO_SQ[key] = [];
    if (!SF_TO_SQ[key].includes(sqId as SQQuestionId)) {
      SF_TO_SQ[key].push(sqId as SQQuestionId);
    }
  }
}

// ── Per-source line builders ──────────────────────────────────────────

function sqLines(source: string, criteriaData: Record<string, unknown>): DisplayGroup[] {
  const sqIds = SF_TO_SQ[source];
  if (!sqIds) return [];
  const sqData = criteriaData["sq"] as Record<string, unknown> | undefined;
  return sqIds.map((sqId) => ({
    badge: SQ_DISPLAY_IDS[sqId],
    headline: SQ_QUESTION_SHORT_LABELS[sqId],
    value: translateValue(sqData?.[sqId]),
  }));
}

function u1aLines(
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region,
): DisplayGroup[] {
  const painLocs = get(criteriaData, `e1.painLocation.${side}`) as Region[] | undefined;
  return [
    {
      badge: "U1A",
      headline: `Schmerzlokalisation, ${REGIONS[region]}, ${SIDES[side]}`,
      value: painLocs === undefined ? "—" : painLocs.includes(region) ? "Ja" : "Nein",
    },
  ];
}

function u1bLines(criteriaData: Record<string, unknown>, side: Side): DisplayGroup[] {
  const headacheLocs = get(criteriaData, `e1.headacheLocation.${side}`) as Region[] | undefined;
  return [
    {
      badge: "U1B",
      headline: `Kopfschmerzlokalisation, Temporalis, ${SIDES[side]}`,
      value:
        headacheLocs === undefined ? "—" : headacheLocs.includes("temporalis") ? "Ja" : "Nein",
    },
  ];
}

function u2Lines(criteriaData: Record<string, unknown>): DisplayGroup[] {
  const val = get(criteriaData, "e2.verticalOverlap");
  return [
    {
      badge: "U2",
      headline: "Vertikaler Überbiss",
      value: val == null ? "—" : `${val} mm`,
    },
  ];
}

const OPENING_STEPS = [
  { key: "maxUnassisted", badge: "U4B", label: "max. aktiver Mundöffnung" },
  { key: "maxAssisted", badge: "U4C", label: "max. passiver Mundöffnung" },
] as const;

function u4StepLines(
  stepIndex: number,
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region,
): DisplayGroup[] {
  const { key, badge, label } = OPENING_STEPS[stepIndex];
  const loc = `${REGIONS[region]}, ${SIDES[side]}`;
  const lines: DisplayGroup[] = [
    {
      badge,
      headline: `${PAIN_TYPES.familiarPain} nach ${label}, ${loc}`,
      value: translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarPain`)),
    },
  ];
  if (region === "temporalis") {
    lines.push({
      badge,
      headline: `${PAIN_TYPES.familiarHeadache} nach ${label}, ${loc}`,
      value: translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarHeadache`)),
    });
  }
  return lines;
}

const LATERAL_STEPS = [
  { key: "lateralRight", badge: "U5A", label: "Laterotrusion rechts" },
  { key: "lateralLeft", badge: "U5B", label: "Laterotrusion links" },
  { key: "protrusive", badge: "U5C", label: "Protrusion" },
] as const;

function u5StepLines(
  stepIndex: number,
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region,
): DisplayGroup[] {
  const { key, badge, label } = LATERAL_STEPS[stepIndex];
  const loc = `${REGIONS[region]}, ${SIDES[side]}`;
  const lines: DisplayGroup[] = [
    {
      badge,
      headline: `${PAIN_TYPES.familiarPain} nach ${label}, ${loc}`,
      value: translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarPain`)),
    },
  ];
  if (region === "temporalis") {
    lines.push({
      badge,
      headline: `${PAIN_TYPES.familiarHeadache} nach ${label}, ${loc}`,
      value: translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarHeadache`)),
    });
  }
  return lines;
}

function u6Lines(criteriaData: Record<string, unknown>, side: Side): DisplayGroup[] {
  const s = SIDES[side];
  return [
    {
      badge: "U6",
      headline: `Knacken bei Öffnung (Untersucher), ${s}`,
      value: translateValue(get(criteriaData, `e6.${side}.click.examinerOpen`)),
    },
    {
      badge: "U6",
      headline: `Knacken bei Schließung (Untersucher), ${s}`,
      value: translateValue(get(criteriaData, `e6.${side}.click.examinerClose`)),
    },
    {
      badge: "U6",
      headline: `Knacken (Patient), ${s}`,
      value: translateValue(get(criteriaData, `e6.${side}.click.patient`)),
    },
    {
      badge: "U6",
      headline: `Reiben bei Öffnung (Untersucher), ${s}`,
      value: translateValue(get(criteriaData, `e6.${side}.crepitus.examinerOpen`)),
    },
    {
      badge: "U6",
      headline: `Reiben bei Schließung (Untersucher), ${s}`,
      value: translateValue(get(criteriaData, `e6.${side}.crepitus.examinerClose`)),
    },
    {
      badge: "U6",
      headline: `Reiben (Patient), ${s}`,
      value: translateValue(get(criteriaData, `e6.${side}.crepitus.patient`)),
    },
  ];
}

function u7Lines(criteriaData: Record<string, unknown>, side: Side): DisplayGroup[] {
  const s = SIDES[side];
  return [
    {
      badge: "U7",
      headline: `Knacken (Untersucher), ${s}`,
      value: translateValue(get(criteriaData, `e7.${side}.click.examiner`)),
    },
    {
      badge: "U7",
      headline: `Knacken (Patient), ${s}`,
      value: translateValue(get(criteriaData, `e7.${side}.click.patient`)),
    },
    {
      badge: "U7",
      headline: `Reiben (Untersucher), ${s}`,
      value: translateValue(get(criteriaData, `e7.${side}.crepitus.examiner`)),
    },
    {
      badge: "U7",
      headline: `Reiben (Patient), ${s}`,
      value: translateValue(get(criteriaData, `e7.${side}.crepitus.patient`)),
    },
  ];
}

function palpationLines(
  section: "e9" | "e10",
  badge: string,
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region,
  siteFilter?: PalpationSite,
): DisplayGroup[] {
  const lines: DisplayGroup[] = [];
  const sitesToShow = siteFilter ? [siteFilter] : (SITES_BY_GROUP[region] ?? []);
  for (const site of sitesToShow) {
    if (SITE_CONFIG[site].section !== section) continue;
    const loc = `${PALPATION_SITES[site]}, ${SIDES[side]}`;
    lines.push({
      badge,
      headline: `${PAIN_TYPES.familiarPain}, ${loc}`,
      value: translateValue(get(criteriaData, `${section}.${side}.${site}.familiarPain`)),
    });
    if (section === "e9" && SITE_CONFIG[site].hasHeadache) {
      lines.push({
        badge,
        headline: `${PAIN_TYPES.familiarHeadache}, ${loc}`,
        value: translateValue(get(criteriaData, `${section}.${side}.${site}.familiarHeadache`)),
      });
    }
  }
  return lines;
}

// ── Main entry point ──────────────────────────────────────────────────

export function getDisplayGroups(
  sources: string[],
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region,
  site?: PalpationSite,
): DisplayGroup[] {
  const groups: DisplayGroup[] = [];

  for (const source of sources) {
    if (source.startsWith("SF")) {
      groups.push(...sqLines(source, criteriaData));
    } else if (source === "U1A") {
      groups.push(...u1aLines(criteriaData, side, region));
    } else if (source === "U1B") {
      groups.push(...u1bLines(criteriaData, side));
    } else if (source === "U2") {
      groups.push(...u2Lines(criteriaData));
    } else if (source === "U4B") {
      groups.push(...u4StepLines(0, criteriaData, side, region));
    } else if (source === "U4C") {
      groups.push(...u4StepLines(1, criteriaData, side, region));
    } else if (source === "U5A") {
      groups.push(...u5StepLines(0, criteriaData, side, region));
    } else if (source === "U5B") {
      groups.push(...u5StepLines(1, criteriaData, side, region));
    } else if (source === "U5C") {
      groups.push(...u5StepLines(2, criteriaData, side, region));
    } else if (source === "U6") {
      groups.push(...u6Lines(criteriaData, side));
    } else if (source === "U7") {
      groups.push(...u7Lines(criteriaData, side));
    } else if (source === "U9") {
      groups.push(...palpationLines("e9", "U9", criteriaData, side, region, site));
    } else if (source === "U10") {
      groups.push(...palpationLines("e10", "U10", criteriaData, side, region, site));
    }
  }

  return groups;
}
