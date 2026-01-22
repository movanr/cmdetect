/**
 * E3: Opening Pattern (Supplemental)
 *
 * - Pattern: straight or corrected deviation
 * - Uncorrected deviation direction: only if pattern is corrected deviation
 */

import { M } from "../model/nodes";
import { Q } from "../model/primitives";

// Opening pattern options
const OPENING_PATTERN_OPTIONS = ["straight", "correctedDeviation"] as const;

const OPENING_PATTERN_LABELS: Record<(typeof OPENING_PATTERN_OPTIONS)[number], string> = {
  straight: "Gerade",
  correctedDeviation: "Korrigierte Deviation",
};

// Uncorrected deviation direction options
const DEVIATION_DIRECTION_OPTIONS = ["right", "left"] as const;

const DEVIATION_DIRECTION_LABELS: Record<(typeof DEVIATION_DIRECTION_OPTIONS)[number], string> = {
  right: "Rechts",
  left: "Links",
};

export const E3_MODEL = M.group({
  // Opening pattern
  pattern: M.question(
    Q.enum({
      options: OPENING_PATTERN_OPTIONS,
      labels: OPENING_PATTERN_LABELS,
      required: true,
    }),
    "openingPattern"
  ),
  // Uncorrected deviation direction (only when pattern is correctedDeviation)
  uncorrectedDeviation: M.question(
    Q.enum({
      options: DEVIATION_DIRECTION_OPTIONS,
      labels: DEVIATION_DIRECTION_LABELS,
      required: false, // Only required when pattern is correctedDeviation
      enableWhen: { sibling: "pattern", equals: "correctedDeviation" },
    }),
    "uncorrectedDeviation"
  ),
});

// Steps - all fields together
export const E3_STEPS = {
  "e3-all": ["pattern", "uncorrectedDeviation"],
} as const;

// Export types
export type OpeningPatternOption = (typeof OPENING_PATTERN_OPTIONS)[number];
export type DeviationDirectionOption = (typeof DEVIATION_DIRECTION_OPTIONS)[number];
export {
  OPENING_PATTERN_OPTIONS,
  OPENING_PATTERN_LABELS,
  DEVIATION_DIRECTION_OPTIONS,
  DEVIATION_DIRECTION_LABELS,
};
