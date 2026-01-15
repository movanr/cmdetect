/**
 * Types for the interactive E4 examination mode.
 *
 * Uses E4_PAIN_REGIONS from definition as the source of truth for regions.
 */

import type { Side } from "../../model/side";
import { REGIONS, type Region } from "../../model/region";
import { E4_PAIN_REGIONS } from "../../definition/sections/e4-opening";

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

/**
 * Regions shown on the SVG head diagram (excludes OTHER_MAST).
 */
export const SVG_REGIONS: readonly Region[] = [
  REGIONS.TEMPORALIS,
  REGIONS.MASSETER,
  REGIONS.TMJ,
  REGIONS.NON_MAST,
];

/**
 * Total number of E4 regions (5 per side = 10 total).
 */
export const TOTAL_REGIONS = E4_PAIN_REGIONS.length * 2;

// Re-export for convenience
export { E4_PAIN_REGIONS };
export type { Region };
