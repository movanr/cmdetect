/**
 * Types for the HeadDiagram component.
 *
 * Provides visual state management for anatomical regions during examination.
 * Mirrors v1 examination pattern for consistency.
 */

import type { PalpationSite, Region, Side } from "../../model/regions";

/**
 * Unique identifier for a region including side.
 * Format: "{side}-{region}" e.g., "left-temporalis"
 */
export type RegionId = `${Side}-${Region}`;

/**
 * Status of a single region for display purposes.
 */
export interface RegionStatus {
  /** Whether pain has been answered */
  hasData: boolean;
  /** Whether pain = yes */
  isPainPositive: boolean;
  /** Whether familiar pain has been answered */
  hasFamiliarPainData: boolean;
  /** Whether familiar pain = yes */
  hasFamiliarPain: boolean;
  /** Whether familiar headache has been answered */
  hasFamiliarHeadacheData: boolean;
  /** Whether familiar headache = yes */
  hasFamiliarHeadache: boolean;
  /** Whether all applicable questions are answered */
  isComplete: boolean;
}

/**
 * Default empty status for a region.
 */
export const EMPTY_REGION_STATUS: RegionStatus = {
  hasData: false,
  isPainPositive: false,
  hasFamiliarPainData: false,
  hasFamiliarPain: false,
  hasFamiliarHeadacheData: false,
  hasFamiliarHeadache: false,
  isComplete: false,
};

// =============================================================================
// Visual State Model
// =============================================================================

/**
 * Visual states for region rendering.
 *
 * Simplified model:
 * - Light gray: incomplete (no data or awaiting familiar pain answers)
 * - Dark gray: complete with no significant findings
 * - Blue: significant finding (familiar pain positive)
 */
export const REGION_VISUAL_STATES = {
  /** No data entered yet */
  PENDING: "pending",
  /** Pain=yes but familiar pain questions not yet answered */
  UNDEFINED: "undefined",
  /** Complete with no significant findings (pain=no OR pain=yes with all familiar=no) */
  NEGATIVE: "negative",
  /** Significant finding: familiar pain or familiar headache = yes */
  POSITIVE: "positive",
} as const;

export type RegionVisualState = (typeof REGION_VISUAL_STATES)[keyof typeof REGION_VISUAL_STATES];

/**
 * Derive the visual state from a RegionStatus.
 */
export function getRegionVisualState(status: RegionStatus): RegionVisualState {
  if (!status.hasData) {
    return REGION_VISUAL_STATES.PENDING;
  }
  if (!status.isPainPositive) {
    return REGION_VISUAL_STATES.NEGATIVE;
  }
  // Pain is positive - check for significant findings
  if (status.hasFamiliarPain || status.hasFamiliarHeadache) {
    return REGION_VISUAL_STATES.POSITIVE;
  }
  // Pain=yes but not complete (familiar questions not yet answered)
  if (!status.isComplete) {
    return REGION_VISUAL_STATES.UNDEFINED;
  }
  // Pain=yes, all familiar answered, all=no
  return REGION_VISUAL_STATES.NEGATIVE;
}

/**
 * Color definitions for each visual state.
 * Includes both Tailwind classes and SVG-compatible color values.
 *
 * Color strategy:
 * - Light gray = incomplete (no data or awaiting answers)
 * - Dark gray = complete with no significant findings
 * - Blue = significant finding (familiar pain positive)
 */
export const REGION_STATE_COLORS = {
  [REGION_VISUAL_STATES.PENDING]: {
    // Light gray = no data
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    fill: "#d4d4d8", // zinc-300 (more visible)
    stroke: "#a1a1aa", // zinc-400
  },
  [REGION_VISUAL_STATES.UNDEFINED]: {
    // Light gray = pain=yes but familiar not yet answered
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    fill: "#d4d4d8", // zinc-300 (more visible)
    stroke: "#a1a1aa", // zinc-400
  },
  [REGION_VISUAL_STATES.NEGATIVE]: {
    // Dark gray = complete, no significant findings
    text: "text-zinc-600",
    bg: "bg-zinc-200",
    border: "border-zinc-400",
    fill: "#a1a1aa", // zinc-400 (opaque)
    stroke: "#71717a", // zinc-500
  },
  [REGION_VISUAL_STATES.POSITIVE]: {
    // Blue = significant finding (familiar pain positive)
    text: "text-blue-700",
    bg: "bg-blue-100",
    border: "border-blue-500",
    fill: "#93c5fd", // blue-300 (opaque)
    stroke: "#3b82f6", // blue-500
  },
} as const;

/**
 * Stroke width constants for region rendering.
 */
export const REGION_STROKE_WIDTH = {
  default: "0.5",
  selected: "1.0",
} as const;

/**
 * Darker color variants for selected regions.
 * Selection uses a darker shade of the current clinical color.
 * Includes both SVG values (fill/stroke) and Tailwind classes (bgClass/ringClass).
 */
export const REGION_STATE_COLORS_SELECTED = {
  [REGION_VISUAL_STATES.PENDING]: {
    fill: "#a1a1aa", // zinc-400 (opaque, darker than base)
    stroke: "#71717a", // zinc-500
    bgClass: "bg-zinc-100",
    ringClass: "ring-1 ring-zinc-400",
  },
  [REGION_VISUAL_STATES.UNDEFINED]: {
    fill: "#a1a1aa", // zinc-400 (opaque, darker than base)
    stroke: "#71717a", // zinc-500
    bgClass: "bg-zinc-100",
    ringClass: "ring-1 ring-zinc-400",
  },
  [REGION_VISUAL_STATES.NEGATIVE]: {
    fill: "#71717a", // zinc-500 (opaque, darker than base)
    stroke: "#52525b", // zinc-600
    bgClass: "bg-zinc-200",
    ringClass: "ring-1 ring-zinc-500",
  },
  [REGION_VISUAL_STATES.POSITIVE]: {
    fill: "#60a5fa", // blue-400 (opaque, darker than base)
    stroke: "#2563eb", // blue-600
    bgClass: "bg-blue-100",
    ringClass: "ring-1 ring-blue-600",
  },
} as const;

/**
 * Parse a RegionId into its components.
 */
export function parseRegionId(regionId: RegionId): {
  side: Side;
  region: Region;
} {
  const [side, region] = regionId.split("-") as [Side, Region];
  return { side, region };
}

/**
 * Build a RegionId from side and region.
 */
export function buildRegionId(side: Side, region: Region): RegionId {
  return `${side}-${region}`;
}

// =============================================================================
// Palpation Site Visual Model (E9)
// =============================================================================

/**
 * Unique identifier for a palpation site including side.
 * Format: "{side}-{site}" e.g., "left-temporalisPosterior"
 */
export type SiteId = `${Side}-${PalpationSite}`;

/**
 * Build a SiteId from side and palpation site.
 */
export function buildSiteId(side: Side, site: PalpationSite): SiteId {
  return `${side}-${site}`;
}

/**
 * Parse a SiteId into its components.
 */
export function parseSiteId(siteId: SiteId): {
  side: Side;
  site: PalpationSite;
} {
  const [side, site] = siteId.split("-") as [Side, PalpationSite];
  return { side, site };
}

/**
 * Status for a palpation site - reuses RegionStatus structure.
 * Both regions and palpation sites use the same pain questions.
 */
export type SiteStatus = RegionStatus;

/**
 * Default empty status for a palpation site.
 */
export const EMPTY_SITE_STATUS: SiteStatus = EMPTY_REGION_STATUS;

/**
 * Circle IDs in the SVG for each palpation site.
 * Maps palpation sites to their corresponding SVG circle element IDs.
 * Used by HeadDiagramPalpation to apply styles and handle clicks.
 */
export const PALPATION_CIRCLE_GROUPS: Record<PalpationSite, readonly string[]> = {
  // Temporalis sites (3 circles each, arranged in columns)
  temporalisPosterior: [
    "temporalisPosterior-1",
    "temporalisPosterior-2",
    "temporalisPosterior-3",
  ],
  temporalisMiddle: ["temporalisMiddle-1", "temporalisMiddle-2", "temporalisMiddle-3"],
  temporalisAnterior: [
    "temporalisAnterior-1",
    "temporalisAnterior-2",
    "temporalisAnterior-3",
  ],
  // Masseter sites (3 circles each, arranged in rows)
  masseterOrigin: ["masseterOrigin-1", "masseterOrigin-2", "masseterOrigin-3"],
  masseterBody: ["masseterBody-1", "masseterBody-2", "masseterBody-3"],
  masseterInsertion: ["masseterInsertion-1", "masseterInsertion-2", "masseterInsertion-3"],
  // TMJ sites (1 circle each)
  tmjLateralPole: ["tmjLateralPole"],
  tmjAroundLateralPole: ["tmjAroundLateralPole"],
};

/**
 * All palpation circle IDs in the SVG (flat list).
 */
export const ALL_PALPATION_CIRCLE_IDS = Object.values(PALPATION_CIRCLE_GROUPS).flat();

/**
 * Map a circle ID to its parent palpation site.
 */
export function getCirclePalpationSite(circleId: string): PalpationSite | null {
  for (const [site, circles] of Object.entries(PALPATION_CIRCLE_GROUPS)) {
    if (circles.includes(circleId)) {
      return site as PalpationSite;
    }
  }
  return null;
}
