/**
 * Types for the HeadDiagram component.
 *
 * Provides visual state management for anatomical regions during examination.
 * Mirrors v1 examination pattern for consistency.
 */

import type { Region, Side } from "../../model/regions";

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
    fill: "#f4f4f5", // zinc-100
    stroke: "#e4e4e7", // zinc-200
  },
  [REGION_VISUAL_STATES.UNDEFINED]: {
    // Light gray = pain=yes but familiar not yet answered
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    fill: "#f4f4f5", // zinc-100
    stroke: "#e4e4e7", // zinc-200
  },
  [REGION_VISUAL_STATES.NEGATIVE]: {
    // Dark gray = complete, no significant findings
    text: "text-zinc-600",
    bg: "bg-zinc-200",
    border: "border-zinc-400",
    fill: "rgba(161, 161, 170, 0.3)", // zinc-400 30%
    stroke: "#a1a1aa", // zinc-400
  },
  [REGION_VISUAL_STATES.POSITIVE]: {
    // Blue = significant finding (familiar pain positive)
    text: "text-blue-700",
    bg: "bg-blue-100",
    border: "border-blue-500",
    fill: "rgba(59, 130, 246, 0.25)", // blue-500 25%
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
    fill: "rgba(161, 161, 170, 0.4)", // zinc-400 40%
    stroke: "#a1a1aa", // zinc-400
    bgClass: "bg-zinc-100",
    ringClass: "ring-1 ring-zinc-400",
  },
  [REGION_VISUAL_STATES.UNDEFINED]: {
    fill: "rgba(161, 161, 170, 0.4)", // zinc-400 40%
    stroke: "#a1a1aa", // zinc-400
    bgClass: "bg-zinc-100",
    ringClass: "ring-1 ring-zinc-400",
  },
  [REGION_VISUAL_STATES.NEGATIVE]: {
    fill: "rgba(113, 113, 122, 0.5)", // zinc-500 50%
    stroke: "#71717a", // zinc-500
    bgClass: "bg-zinc-200",
    ringClass: "ring-1 ring-zinc-500",
  },
  [REGION_VISUAL_STATES.POSITIVE]: {
    fill: "rgba(59, 130, 246, 0.5)", // blue-500 50%
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
