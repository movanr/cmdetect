/**
 * criterion-data-display — Structured source-label lookup for the Befunde panel.
 *
 * Maps DC/TMD source labels (SF1–SF14, U1–U10) to structured display groups
 * from criteriaData. Each examination source becomes a group with a headline
 * (the step/procedure) and cards (localization + findings).
 */

import {
  PAIN_TYPES,
  PALPATION_SITES,
  REGIONS,
  SIDES,
  SITE_CONFIG,
  SITES_BY_GROUP,
  getValueAtPath as get,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import {
  SQ_DISPLAY_IDS,
  SQ_QUESTION_SHORT_LABELS,
  type SQQuestionId,
} from "@cmdetect/questionnaires";

// ── Types ─────────────────────────────────────────────────────────────

export interface DisplayEntry {
  label: string;
  value: string;
}

export interface DisplayCard {
  title: string;
  entries: DisplayEntry[];
}

export interface DisplayGroup {
  badge: string;
  headline: string;
  cards: DisplayCard[];
  /** Standalone value when no cards are needed (SF items, U2 measurement) */
  value?: string;
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

// ── Per-source group builders ───────────────────────────────────────

function sqGroups(source: string, criteriaData: Record<string, unknown>): DisplayGroup[] {
  const sqIds = SF_TO_SQ[source];
  if (!sqIds) return [];
  const sqData = criteriaData["sq"] as Record<string, unknown> | undefined;
  return sqIds.map((sqId) => ({
    badge: SQ_DISPLAY_IDS[sqId],
    headline: SQ_QUESTION_SHORT_LABELS[sqId],
    cards: [],
    value: translateValue(sqData?.[sqId]),
  }));
}

function u1aGroup(
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region
): DisplayGroup {
  const painLocs = get(criteriaData, `e1.painLocation.${side}`) as Region[] | undefined;
  return {
    badge: "U1A",
    headline: "Schmerzlokalisation (letzte 30 Tage)",
    cards: [
      {
        title: `${REGIONS[region]}, ${SIDES[side]}`,
        entries: [
          {
            label: "Vorhanden",
            value: painLocs === undefined ? "—" : painLocs.includes(region) ? "Ja" : "Nein",
          },
        ],
      },
    ],
  };
}

function u1bGroup(criteriaData: Record<string, unknown>, side: Side): DisplayGroup {
  const headacheLocs = get(criteriaData, `e1.headacheLocation.${side}`) as Region[] | undefined;
  return {
    badge: "U1B",
    headline: "Kopfschmerzlokalisation (letzte 30 Tage)",
    cards: [
      {
        title: `Temporalis, ${SIDES[side]}`,
        entries: [
          {
            label: "Vorhanden",
            value:
              headacheLocs === undefined
                ? "—"
                : headacheLocs.includes("temporalis")
                  ? "Ja"
                  : "Nein",
          },
        ],
      },
    ],
  };
}

function u2Group(criteriaData: Record<string, unknown>): DisplayGroup {
  const val = get(criteriaData, "e2.verticalOverlap");
  return {
    badge: "U2",
    headline: "Vertikaler Überbiss",
    cards: [],
    value: val == null ? "—" : `${val} mm`,
  };
}

const OPENING_STEPS = [
  { key: "maxUnassisted", badge: "U4B", label: "Max. aktive Mundöffnung" },
  { key: "maxAssisted", badge: "U4C", label: "Max. passive Mundöffnung" },
] as const;

function u4StepGroup(
  stepIndex: number,
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region
): DisplayGroup {
  const { key, badge, label } = OPENING_STEPS[stepIndex];
  const entries: DisplayEntry[] = [
    {
      label: PAIN_TYPES.familiarPain,
      value: translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarPain`)),
    },
  ];
  if (region === "temporalis") {
    entries.push({
      label: PAIN_TYPES.familiarHeadache,
      value: translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarHeadache`)),
    });
  }
  return {
    badge,
    headline: label,
    cards: [{ title: `${REGIONS[region]}, ${SIDES[side]}`, entries }],
  };
}

const LATERAL_STEPS = [
  { key: "lateralRight", badge: "U5A", label: "Laterotrusion rechts" },
  { key: "lateralLeft", badge: "U5B", label: "Laterotrusion links" },
  { key: "protrusive", badge: "U5C", label: "Protrusion" },
] as const;

function u5StepGroup(
  stepIndex: number,
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region
): DisplayGroup {
  const { key, badge, label } = LATERAL_STEPS[stepIndex];
  const entries: DisplayEntry[] = [
    {
      label: PAIN_TYPES.familiarPain,
      value: translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarPain`)),
    },
  ];
  if (region === "temporalis") {
    entries.push({
      label: PAIN_TYPES.familiarHeadache,
      value: translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarHeadache`)),
    });
  }
  return {
    badge,
    headline: label,
    cards: [{ title: `${REGIONS[region]}, ${SIDES[side]}`, entries }],
  };
}

function u6Group(criteriaData: Record<string, unknown>, side: Side): DisplayGroup {
  const entries: DisplayEntry[] = [
    {
      label: "Knacken bei Öffnung (Untersucher)",
      value: translateValue(get(criteriaData, `e6.${side}.click.examinerOpen`)),
    },
    {
      label: "Knacken bei Schließung (Untersucher)",
      value: translateValue(get(criteriaData, `e6.${side}.click.examinerClose`)),
    },
    {
      label: "Knacken (Patient)",
      value: translateValue(get(criteriaData, `e6.${side}.click.patient`)),
    },
    {
      label: "Reiben bei Öffnung (Untersucher)",
      value: translateValue(get(criteriaData, `e6.${side}.crepitus.examinerOpen`)),
    },
    {
      label: "Reiben bei Schließung (Untersucher)",
      value: translateValue(get(criteriaData, `e6.${side}.crepitus.examinerClose`)),
    },
    {
      label: "Reiben (Patient)",
      value: translateValue(get(criteriaData, `e6.${side}.crepitus.patient`)),
    },
  ];
  return {
    badge: "U6",
    headline: "Gelenkgeräusche bei Öffnung/Schließung",
    cards: [{ title: SIDES[side], entries }],
  };
}

function u7Group(criteriaData: Record<string, unknown>, side: Side): DisplayGroup {
  const entries: DisplayEntry[] = [
    {
      label: "Knacken (Untersucher)",
      value: translateValue(get(criteriaData, `e7.${side}.click.examiner`)),
    },
    {
      label: "Knacken (Patient)",
      value: translateValue(get(criteriaData, `e7.${side}.click.patient`)),
    },
    {
      label: "Reiben (Untersucher)",
      value: translateValue(get(criteriaData, `e7.${side}.crepitus.examiner`)),
    },
    {
      label: "Reiben (Patient)",
      value: translateValue(get(criteriaData, `e7.${side}.crepitus.patient`)),
    },
  ];
  return {
    badge: "U7",
    headline: "Gelenkgeräusche bei Laterotrusion/Protrusion",
    cards: [{ title: SIDES[side], entries }],
  };
}

function palpationGroup(
  section: "e9" | "e10",
  badge: string,
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region
): DisplayGroup {
  const cards: DisplayCard[] = [];
  for (const site of SITES_BY_GROUP[region] ?? []) {
    if (SITE_CONFIG[site].section !== section) continue;
    const entries: DisplayEntry[] = [
      {
        label: PAIN_TYPES.familiarPain,
        value: translateValue(get(criteriaData, `${section}.${side}.${site}.familiarPain`)),
      },
    ];
    if (section === "e9" && SITE_CONFIG[site].hasHeadache) {
      entries.push({
        label: PAIN_TYPES.familiarHeadache,
        value: translateValue(get(criteriaData, `${section}.${side}.${site}.familiarHeadache`)),
      });
    }
    cards.push({ title: `${PALPATION_SITES[site]}, ${SIDES[side]}`, entries });
  }
  return {
    badge,
    headline: section === "e9" ? "Palpation" : "Ergänzende Palpation",
    cards,
  };
}

// ── Main entry point ──────────────────────────────────────────────────

export function getDisplayGroups(
  sources: string[],
  criteriaData: Record<string, unknown>,
  side: Side,
  region: Region
): DisplayGroup[] {
  const groups: DisplayGroup[] = [];

  for (const source of sources) {
    if (source.startsWith("SF")) {
      groups.push(...sqGroups(source, criteriaData));
    } else if (source === "U1A") {
      groups.push(u1aGroup(criteriaData, side, region));
    } else if (source === "U1B") {
      groups.push(u1bGroup(criteriaData, side));
    } else if (source === "U2") {
      groups.push(u2Group(criteriaData));
    } else if (source === "U4B") {
      groups.push(u4StepGroup(0, criteriaData, side, region));
    } else if (source === "U4C") {
      groups.push(u4StepGroup(1, criteriaData, side, region));
    } else if (source === "U5A") {
      groups.push(u5StepGroup(0, criteriaData, side, region));
    } else if (source === "U5B") {
      groups.push(u5StepGroup(1, criteriaData, side, region));
    } else if (source === "U5C") {
      groups.push(u5StepGroup(2, criteriaData, side, region));
    } else if (source === "U6") {
      groups.push(u6Group(criteriaData, side));
    } else if (source === "U7") {
      groups.push(u7Group(criteriaData, side));
    } else if (source === "U9") {
      groups.push(palpationGroup("e9", "U9", criteriaData, side, region));
    } else if (source === "U10") {
      groups.push(palpationGroup("e10", "U10", criteriaData, side, region));
    }
  }

  return groups;
}
