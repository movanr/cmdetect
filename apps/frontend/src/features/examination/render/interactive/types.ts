/**
 * Types for the interactive E4 examination mode.
 *
 * Uses a finite state machine approach with two states:
 * - IDLE: Waiting for examiner to select a region
 * - QUESTIONING: Asking pain interview questions for a selected region
 */

import type { Side } from "../../model/side";

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
 * Pain interview question types.
 */
export type QuestionType = "pain" | "familiarPain" | "familiarHeadache";

/**
 * FSM States for the interactive examination.
 */
export type ExamStep =
  | { type: "IDLE" }
  | { type: "QUESTIONING"; regionId: RegionId; questionIndex: number };

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

/**
 * Question definition for the pain interview.
 */
export interface QuestionDefinition {
  type: QuestionType;
  /** Whether this question depends on pain = yes */
  requiresPain: boolean;
}

/**
 * Get the questions for a given region.
 * - Temporalis: pain, familiarPain, familiarHeadache
 * - Other masticatory: pain only (no follow-up questions)
 * - Others: pain, familiarPain
 */
export function getQuestionsForRegion(
  region: InteractiveRegion
): QuestionDefinition[] {
  if (region === INTERACTIVE_REGIONS.TEMPORALIS) {
    return [
      { type: "pain", requiresPain: false },
      { type: "familiarPain", requiresPain: true },
      { type: "familiarHeadache", requiresPain: true },
    ];
  }
  if (region === INTERACTIVE_REGIONS.OTHER_MAST) {
    // Other masticatory asks about pain and familiar pain (no familiar headache)
    return [
      { type: "pain", requiresPain: false },
      { type: "familiarPain", requiresPain: true },
    ];
  }
  return [
    { type: "pain", requiresPain: false },
    { type: "familiarPain", requiresPain: true },
  ];
}

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
