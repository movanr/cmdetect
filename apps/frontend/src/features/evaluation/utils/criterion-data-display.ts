/**
 * criterion-data-display — Direct source-label lookup for the Befunde panel.
 *
 * Maps DC/TMD source labels (SF1–SF14, U1–U10) directly to raw data rows
 * from criteriaData. No criterion tree walking — the `sources` array on each
 * criterion item is used as a key to look up what the data says.
 */

import {
  PAIN_TYPES,
  PALPATION_SITES,
  REGIONS,
  SIDES,
  SITE_CONFIG,
  SITES_BY_GROUP,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import {
  SQ_DISPLAY_IDS,
  SQ_QUESTION_SHORT_LABELS,
  type SQQuestionId,
} from "@cmdetect/questionnaires";

// ── Types ─────────────────────────────────────────────────────────────

export interface DisplayRow {
  badge?: string;
  label: string;
  value: string;
}

// ── Helpers ───────────────────────────────────────────────────────────

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((curr, key) => {
    if (curr == null || typeof curr !== "object") return undefined;
    return (curr as Record<string, unknown>)[key];
  }, obj);
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
  // Index both the exact display ID (SF4a) and the base (SF4)
  for (const key of [sfId, sfId.replace(/[a-z]$/, "")]) {
    if (!SF_TO_SQ[key]) SF_TO_SQ[key] = [];
    if (!SF_TO_SQ[key].includes(sqId as SQQuestionId)) {
      SF_TO_SQ[key].push(sqId as SQQuestionId);
    }
  }
}

// ── Per-source row builders ───────────────────────────────────────────

function sqRows(source: string, criteriaData: Record<string, unknown>): DisplayRow[] {
  const sqIds = SF_TO_SQ[source];
  if (!sqIds) return [];
  const sqData = criteriaData["sq"] as Record<string, unknown> | undefined;
  return sqIds.map((sqId) => ({
    badge: SQ_DISPLAY_IDS[sqId],
    label: SQ_QUESTION_SHORT_LABELS[sqId],
    value: translateValue(sqData?.[sqId]),
  }));
}

function u1Rows(criteriaData: Record<string, unknown>, side: Side, region: Region): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const sideLabel = SIDES[side];
  const regionLabel = REGIONS[region];

  const painLocs = get(criteriaData, `e1.painLocation.${side}`) as Region[] | undefined;
  rows.push({
    badge: "U1A",
    label: `Schmerzlokalisation (letzte 30 Tage), ${regionLabel}, ${sideLabel}`,
    value: painLocs === undefined ? "—" : painLocs.includes(region) ? "Ja" : "Nein",
  });

  if (region === "temporalis") {
    const headacheLocs = get(criteriaData, `e1.headacheLocation.${side}`) as Region[] | undefined;
    rows.push({
      badge: "U1B",
      label: `Kopfschmerzlokalisation (letzte 30 Tage), Temporalis, ${sideLabel}`,
      value:
        headacheLocs === undefined ? "—" : headacheLocs.includes("temporalis") ? "Ja" : "Nein",
    });
  }

  return rows;
}

function u2Rows(criteriaData: Record<string, unknown>): DisplayRow[] {
  const val = get(criteriaData, "e2.verticalOverlap");
  return [
    {
      badge: "U2",
      label: "Vertikaler Überbiss",
      value: val == null ? "—" : `${val} mm`,
    },
  ];
}

const OPENING_STEPS = [
  { key: "maxUnassisted", badge: "U4B", label: "Max. aktive Mundöffnung" },
  { key: "maxAssisted", badge: "U4C", label: "Max. passive Mundöffnung" },
] as const;

function u4Rows(criteriaData: Record<string, unknown>, side: Side, region: Region): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const regionLabel = REGIONS[region];
  const sideLabel = SIDES[side];

  for (const { key, badge, label } of OPENING_STEPS) {
    rows.push({
      badge,
      label: `${label}, ${PAIN_TYPES.familiarPain}, ${regionLabel}, ${sideLabel}`,
      value: translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarPain`)),
    });
    if (region === "temporalis") {
      rows.push({
        badge,
        label: `${label}, ${PAIN_TYPES.familiarHeadache}, Temporalis, ${sideLabel}`,
        value: translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarHeadache`)),
      });
    }
  }

  return rows;
}

const LATERAL_STEPS = [
  { key: "lateralRight", badge: "U5A", label: "Laterotrusion rechts" },
  { key: "lateralLeft", badge: "U5B", label: "Laterotrusion links" },
  { key: "protrusive", badge: "U5C", label: "Protrusion" },
] as const;

function u5Rows(criteriaData: Record<string, unknown>, side: Side, region: Region): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const regionLabel = REGIONS[region];
  const sideLabel = SIDES[side];

  for (const { key, badge, label } of LATERAL_STEPS) {
    rows.push({
      badge,
      label: `${label}, ${PAIN_TYPES.familiarPain}, ${regionLabel}, ${sideLabel}`,
      value: translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarPain`)),
    });
    if (region === "temporalis") {
      rows.push({
        badge,
        label: `${label}, ${PAIN_TYPES.familiarHeadache}, Temporalis, ${sideLabel}`,
        value: translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarHeadache`)),
      });
    }
  }

  return rows;
}

function u6Rows(criteriaData: Record<string, unknown>, side: Side): DisplayRow[] {
  const sideLabel = SIDES[side];
  const fields: { sub: string; label: string }[] = [
    { sub: "click.examinerOpen", label: "Knacken bei Öffnung (Untersucher)" },
    { sub: "click.examinerClose", label: "Knacken bei Schließung (Untersucher)" },
    { sub: "click.patient", label: "Knacken (Patient)" },
    { sub: "crepitus.examinerOpen", label: "Reiben bei Öffnung (Untersucher)" },
    { sub: "crepitus.examinerClose", label: "Reiben bei Schließung (Untersucher)" },
    { sub: "crepitus.patient", label: "Reiben (Patient)" },
  ];
  return fields.map(({ sub, label }) => ({
    badge: "U6",
    label: `${label}, ${sideLabel}`,
    value: translateValue(get(criteriaData, `e6.${side}.${sub}`)),
  }));
}

function u7Rows(criteriaData: Record<string, unknown>, side: Side): DisplayRow[] {
  const sideLabel = SIDES[side];
  const fields: { sub: string; label: string }[] = [
    { sub: "click.examiner", label: "Knacken bei Lateral-/Protrusionsbewegung (Untersucher)" },
    { sub: "click.patient", label: "Knacken bei Lateral-/Protrusionsbewegung (Patient)" },
    { sub: "crepitus.examiner", label: "Reiben bei Lateral-/Protrusionsbewegung (Untersucher)" },
    { sub: "crepitus.patient", label: "Reiben bei Lateral-/Protrusionsbewegung (Patient)" },
  ];
  return fields.map(({ sub, label }) => ({
    badge: "U7",
    label: `${label}, ${sideLabel}`,
    value: translateValue(get(criteriaData, `e7.${side}.${sub}`)),
  }));
}

function palpationRows(
  section: "e9" | "e10",
  badge: string,
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region
): DisplayRow[] {
  const sideLabel = SIDES[side];
  const rows: DisplayRow[] = [];

  for (const site of SITES_BY_GROUP[region] ?? []) {
    if (SITE_CONFIG[site].section !== section) continue;
    const siteName = PALPATION_SITES[site];

    rows.push({
      badge,
      label: `${siteName}, ${PAIN_TYPES.familiarPain}, ${sideLabel}`,
      value: translateValue(get(criteriaData, `${section}.${side}.${site}.familiarPain`)),
    });

    if (section === "e9" && SITE_CONFIG[site].hasHeadache) {
      rows.push({
        badge,
        label: `${siteName}, ${PAIN_TYPES.familiarHeadache}, ${sideLabel}`,
        value: translateValue(get(criteriaData, `${section}.${side}.${site}.familiarHeadache`)),
      });
    }
  }

  return rows;
}

// ── Main entry point ──────────────────────────────────────────────────

export function getDisplayRows(
  sources: string[],
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region
): DisplayRow[] {
  const rows: DisplayRow[] = [];

  for (const source of sources) {
    if (source.startsWith("SF")) {
      rows.push(...sqRows(source, criteriaData));
    } else if (source === "U1") {
      rows.push(...u1Rows(criteriaData, side, region));
    } else if (source === "U2") {
      rows.push(...u2Rows(criteriaData));
    } else if (source === "U4") {
      rows.push(...u4Rows(criteriaData, side, region));
    } else if (source === "U5") {
      rows.push(...u5Rows(criteriaData, side, region));
    } else if (source === "U6") {
      rows.push(...u6Rows(criteriaData, side));
    } else if (source === "U7") {
      rows.push(...u7Rows(criteriaData, side));
    } else if (source === "U9") {
      rows.push(...palpationRows("e9", "U9", criteriaData, side, region));
    } else if (source === "U10") {
      rows.push(...palpationRows("e10", "U10", criteriaData, side, region));
    }
  }

  return rows;
}
