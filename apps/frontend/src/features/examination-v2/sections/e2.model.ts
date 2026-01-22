/**
 * E2: Incisal Relationships
 *
 * - Reference tooth selection
 * - Horizontal overjet (mm, can be negative for anterior cross-bite)
 * - Vertical overlap (mm, can be negative for anterior open-bite)
 * - Midline deviation (direction + mm if applicable)
 */

import { M } from "../model/nodes";
import { Q } from "../model/primitives";

// Reference tooth options
const REFERENCE_TOOTH_OPTIONS = ["tooth8", "tooth9", "other"] as const;

const REFERENCE_TOOTH_LABELS: Record<(typeof REFERENCE_TOOTH_OPTIONS)[number], string> = {
  tooth8: "#8 (11)",
  tooth9: "#9 (21)",
  other: "Anderer",
};

// Midline deviation direction options
const MIDLINE_DIRECTION_OPTIONS = ["right", "left", "na"] as const;

const MIDLINE_DIRECTION_LABELS: Record<(typeof MIDLINE_DIRECTION_OPTIONS)[number], string> = {
  right: "Rechts",
  left: "Links",
  na: "N/A",
};

export const E2_MODEL = M.group({
  // Reference tooth selection
  referenceTooth: M.question(
    Q.enum({
      options: REFERENCE_TOOTH_OPTIONS,
      labels: REFERENCE_TOOTH_LABELS,
      required: true,
    }),
    "referenceTooth"
  ),
  // Horizontal overjet (can be negative for anterior cross-bite)
  horizontalOverjet: M.question(
    Q.measurement({ unit: "mm", required: true, allowNegative: true }),
    "horizontalOverjet"
  ),
  // Vertical overlap (can be negative for anterior open-bite)
  verticalOverlap: M.question(
    Q.measurement({ unit: "mm", required: true, allowNegative: true }),
    "verticalOverlap"
  ),
  // Midline deviation
  midlineDeviation: M.group({
    direction: M.question(
      Q.enum({
        options: MIDLINE_DIRECTION_OPTIONS,
        labels: MIDLINE_DIRECTION_LABELS,
        required: true,
      }),
      "midlineDirection"
    ),
    // mm is only shown when direction is not "na"
    mm: M.question(
      Q.measurement({
        unit: "mm",
        required: false, // Validation handled separately based on direction
        enableWhen: { sibling: "direction", notEquals: "na" },
      }),
      "midlineMm"
    ),
  }),
});

// Steps - all fields shown together
export const E2_STEPS = {
  "e2-all": [
    "referenceTooth",
    "horizontalOverjet",
    "verticalOverlap",
    "midlineDeviation.direction",
    "midlineDeviation.mm",
  ],
} as const;

// Export types for use elsewhere
export type ReferenceToothOption = (typeof REFERENCE_TOOTH_OPTIONS)[number];
export type MidlineDirectionOption = (typeof MIDLINE_DIRECTION_OPTIONS)[number];
export {
  REFERENCE_TOOTH_OPTIONS,
  REFERENCE_TOOTH_LABELS,
  MIDLINE_DIRECTION_OPTIONS,
  MIDLINE_DIRECTION_LABELS,
};
