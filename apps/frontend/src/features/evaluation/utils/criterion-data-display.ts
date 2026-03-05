/**
 * criterion-data-display — Transforms a CriterionResult tree into structured
 * display sections for the Befunde detail panel.
 */

import {
  getSectionBadge,
  isCompositeResult,
  isComputedResult,
  isLeafResult,
  isQuantifierResult,
  PAIN_TYPES,
  PALPATION_SITES,
  REGIONS,
  SECTION_LABELS,
  SIDES,
  type CriterionResult,
  type SectionId,
} from "@cmdetect/dc-tmd";

// ── Types ────────────────────────────────────────────────────────────

export interface LeafEntry {
  ref: string;
  value: unknown;
  section: string;
  locationKey: string;
  locationLabel: string;
  rowLabel: string;
}

export interface DisplayRow {
  label: string;
  value: string;
}

export interface DisplayGroup {
  locationLabel: string;
  rows: DisplayRow[];
}

export interface DisplaySection {
  badge: string;
  sectionLabel: string;
  groups: DisplayGroup[];
}

// ── Label maps ───────────────────────────────────────────────────────

const OPENING_TYPE_LABELS: Record<string, string> = {
  maxUnassisted: "Max. ungestützte Öffnung",
  maxAssisted: "Max. gestützte Öffnung",
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  lateralRight: "Laterotrusion rechts",
  lateralLeft: "Laterotrusion links",
  protrusive: "Protrusion",
};

const E1_FIELD_LABELS: Record<string, string> = {
  painAtRest: "Schmerz in Ruhe",
  painWithFunction: "Schmerz bei Funktion",
  painWithParafunctions: "Schmerz bei Parafunktionen",
};

// ── parseRef ─────────────────────────────────────────────────────────

function parseRef(ref: string): {
  section: string;
  locationKey: string;
  locationLabel: string;
  rowLabel: string;
} {
  const parts = ref.split(".");
  const section = parts[0];

  if (section === "sq") {
    return {
      section: "sq",
      locationKey: ref,
      locationLabel: "",
      rowLabel: parts.slice(1).join("."),
    };
  }

  if (section === "e1" && parts.length >= 3) {
    const [, field, side] = parts;
    const sideLabel = SIDES[side as keyof typeof SIDES] ?? side;
    const fieldLabel = E1_FIELD_LABELS[field] ?? field;
    return {
      section: "e1",
      locationKey: `${field}_${side}`,
      locationLabel: `${fieldLabel}, ${sideLabel}`,
      rowLabel: "Wert",
    };
  }

  if (section === "e4" && parts.length >= 5) {
    const [, movement, side, region, painType] = parts;
    const movLabel = OPENING_TYPE_LABELS[movement] ?? movement;
    const regionLabel = REGIONS[region as keyof typeof REGIONS] ?? region;
    const sideLabel = SIDES[side as keyof typeof SIDES] ?? side;
    return {
      section: "e4",
      locationKey: `${movement}_${side}_${region}`,
      locationLabel: `${movLabel} — ${regionLabel}, ${sideLabel}`,
      rowLabel: PAIN_TYPES[painType as keyof typeof PAIN_TYPES] ?? painType,
    };
  }

  if (section === "e5" && parts.length >= 5) {
    const [, movement, side, region, painType] = parts;
    const movLabel = MOVEMENT_TYPE_LABELS[movement] ?? movement;
    const regionLabel = REGIONS[region as keyof typeof REGIONS] ?? region;
    const sideLabel = SIDES[side as keyof typeof SIDES] ?? side;
    return {
      section: "e5",
      locationKey: `${movement}_${side}_${region}`,
      locationLabel: `${movLabel} — ${regionLabel}, ${sideLabel}`,
      rowLabel: PAIN_TYPES[painType as keyof typeof PAIN_TYPES] ?? painType,
    };
  }

  if ((section === "e9" || section === "e10") && parts.length >= 4) {
    const [, side, site, painType] = parts;
    const siteLabel = PALPATION_SITES[site as keyof typeof PALPATION_SITES] ?? site;
    const sideLabel = SIDES[side as keyof typeof SIDES] ?? side;
    return {
      section,
      locationKey: `${site}_${side}`,
      locationLabel: `${siteLabel}, ${sideLabel}`,
      rowLabel: PAIN_TYPES[painType as keyof typeof PAIN_TYPES] ?? painType,
    };
  }

  // Fallback for other sections
  return {
    section,
    locationKey: ref,
    locationLabel: parts.slice(1).join("."),
    rowLabel: "Wert",
  };
}

// ── translateValue ────────────────────────────────────────────────────

function translateValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (value === "yes" || value === true) return "Ja";
  if (value === "no" || value === false) return "Nein";
  if (value === "intermittent") return "Schmerzen kommen und gehen";
  if (value === "continuous") return "Dauerschmerzen";
  if (Array.isArray(value)) {
    return value
      .map(
        (r) =>
          REGIONS[r as keyof typeof REGIONS] ??
          PALPATION_SITES[r as keyof typeof PALPATION_SITES] ??
          String(r)
      )
      .join(", ");
  }
  return String(value);
}

// ── collectLeafEntries ────────────────────────────────────────────────

function collectRaw(result: CriterionResult): LeafEntry[] {
  if (result.criterion.type === "match") return [];

  if (isLeafResult(result)) {
    return [{ ref: result.ref, value: result.value, ...parseRef(result.ref) }];
  }

  if (isQuantifierResult(result)) {
    return Object.entries(result.values).map(([ref, value]) => ({
      ref,
      value,
      ...parseRef(ref),
    }));
  }

  if (isComputedResult(result)) {
    return Object.entries(result.values).map(([ref, value]) => ({
      ref,
      value,
      ...parseRef(ref),
    }));
  }

  if (isCompositeResult(result)) {
    return result.children.flatMap((child) => collectRaw(child));
  }

  return [];
}

export function collectLeafEntries(result: CriterionResult): LeafEntry[] {
  const raw = collectRaw(result);
  const seen = new Set<string>();
  return raw.filter((e) => {
    if (seen.has(e.ref)) return false;
    seen.add(e.ref);
    return true;
  });
}

// ── formatDisplaySections ─────────────────────────────────────────────

export function formatDisplaySections(
  entries: LeafEntry[],
  sources?: string[]
): DisplaySection[] {
  const bySection = new Map<string, LeafEntry[]>();
  for (const entry of entries) {
    const list = bySection.get(entry.section) ?? [];
    list.push(entry);
    bySection.set(entry.section, list);
  }

  const result: DisplaySection[] = [];
  for (const [section, sectionEntries] of bySection) {
    const byLocation = new Map<string, LeafEntry[]>();
    for (const entry of sectionEntries) {
      const list = byLocation.get(entry.locationKey) ?? [];
      list.push(entry);
      byLocation.set(entry.locationKey, list);
    }

    const groups: DisplayGroup[] = [];
    for (const [, locEntries] of byLocation) {
      const locationLabel = locEntries[0]?.locationLabel ?? "";
      const rows: DisplayRow[] = locEntries.map((e) => ({
        label: e.rowLabel,
        value: translateValue(e.value),
      }));
      groups.push({ locationLabel, rows });
    }

    let badge: string;
    let sectionLabel: string;
    if (section === "sq") {
      badge = sources?.[0] ?? "SF";
      sectionLabel = sources?.join(", ") ?? "Screening-Fragebogen";
    } else {
      badge = getSectionBadge(section as SectionId);
      sectionLabel = SECTION_LABELS[section as SectionId]?.short ?? section;
    }

    result.push({ badge, sectionLabel, groups });
  }

  return result;
}
