/**
 * Types for the interactive E4 examination mode.
 */

import type { Side } from "../../model/side";
import { REGIONS, type Region } from "../../model/region";

/**
 * Interactive regions for pain assessment.
 * Note: OTHER_MAST is not shown on SVG but appears in the region list.
 */
export const INTERACTIVE_REGIONS = {
  TEMPORALIS: "temporalis",
  MASSETER: "masseter",
  TMJ: "tmj",
  NON_MAST: "nonMast",
  OTHER_MAST: "otherMast",
} as const;

export type InteractiveRegion =
  (typeof INTERACTIVE_REGIONS)[keyof typeof INTERACTIVE_REGIONS];

/**
 * Unique identifier for a region including side.
 * Format: "{side}-{region}" e.g., "left-temporalis"
 */
export type RegionId = `${Side}-${InteractiveRegion}`;

/**
 * Map interactive region to the corresponding REGIONS constant.
 */
export function mapInteractiveToRegion(region: InteractiveRegion): Region {
  switch (region) {
    case INTERACTIVE_REGIONS.TEMPORALIS:
      return REGIONS.TEMPORALIS;
    case INTERACTIVE_REGIONS.MASSETER:
      return REGIONS.MASSETER;
    case INTERACTIVE_REGIONS.TMJ:
      return REGIONS.TMJ;
    case INTERACTIVE_REGIONS.NON_MAST:
      return REGIONS.NON_MAST;
    case INTERACTIVE_REGIONS.OTHER_MAST:
      return REGIONS.OTHER_MAST;
  }
}

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

/**
 * Progress tracking for the examination.
 */
export interface ExamProgress {
  completed: number;
  total: number;
  percentage: number;
}

// =============================================================================
// Visual State Model
// =============================================================================

/**
 * Visual states for region rendering.
 * Ordered by clinical significance (for consistent UI).
 */
export const REGION_VISUAL_STATES = {
  /** No data entered yet */
  PENDING: "pending",
  /** Pain answered "no" - examination complete, no issues */
  NEGATIVE: "negative",
  /** Pain answered "yes", but no clinically significant findings */
  POSITIVE: "positive",
  /** Clinically significant: familiar pain or familiar headache = yes */
  SIGNIFICANT: "significant",
} as const;

export type RegionVisualState =
  (typeof REGION_VISUAL_STATES)[keyof typeof REGION_VISUAL_STATES];

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
  if (status.hasFamiliarPain || status.hasFamiliarHeadache) {
    return REGION_VISUAL_STATES.SIGNIFICANT;
  }
  return REGION_VISUAL_STATES.POSITIVE;
}

/**
 * Tailwind color classes for each visual state.
 * Use these for consistent styling across components.
 */
export const REGION_STATE_COLORS = {
  [REGION_VISUAL_STATES.PENDING]: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    fill: "#f4f4f5", // zinc-100
    stroke: "#e4e4e7", // zinc-200
  },
  [REGION_VISUAL_STATES.NEGATIVE]: {
    text: "text-green-700",
    bg: "bg-green-100",
    border: "border-green-500",
    fill: "rgba(34, 197, 94, 0.2)", // green-500 20%
    stroke: "#22c55e", // green-500
  },
  [REGION_VISUAL_STATES.POSITIVE]: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary",
    fill: "rgba(59, 130, 246, 0.2)", // blue-500 20%
    stroke: "#3b82f6", // blue-500
  },
  [REGION_VISUAL_STATES.SIGNIFICANT]: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive",
    fill: "rgba(239, 68, 68, 0.2)", // red-500 20%
    stroke: "#ef4444", // red-500
  },
} as const;

/**
 * Parse a RegionId into its components.
 */
export function parseRegionId(regionId: RegionId): {
  side: Side;
  region: InteractiveRegion;
} {
  const [side, region] = regionId.split("-") as [Side, InteractiveRegion];
  return { side, region };
}

/**
 * Build a RegionId from side and region.
 */
export function buildRegionId(
  side: Side,
  region: InteractiveRegion
): RegionId {
  return `${side}-${region}`;
}

/**
 * Regions shown on the SVG head diagram (excludes OTHER_MAST).
 */
export const SVG_REGIONS: InteractiveRegion[] = [
  INTERACTIVE_REGIONS.TEMPORALIS,
  INTERACTIVE_REGIONS.MASSETER,
  INTERACTIVE_REGIONS.TMJ,
  INTERACTIVE_REGIONS.NON_MAST,
];

/**
 * All interactive regions as an array (includes OTHER_MAST for the list).
 */
export const ALL_INTERACTIVE_REGIONS: InteractiveRegion[] = Object.values(
  INTERACTIVE_REGIONS
);

/**
 * Total number of interactive regions (5 per side = 10 total).
 */
export const TOTAL_REGIONS = ALL_INTERACTIVE_REGIONS.length * 2;
