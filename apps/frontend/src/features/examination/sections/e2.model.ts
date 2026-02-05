/**
 * E2: Incisal Relationships
 *
 * - Reference tooth selection
 * - Horizontal overjet (mm, can be negative for anterior cross-bite)
 * - Vertical overlap (mm, can be negative for anterior open-bite)
 * - Midline deviation (direction + mm if applicable)
 */

import {
  E2_FIELDS,
  E2_MIDLINE_DIRECTION_KEYS,
  E2_MIDLINE_DIRECTIONS,
  E2_REFERENCE_TEETH,
  E2_REFERENCE_TOOTH_KEYS,
} from "@cmdetect/dc-tmd";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

export const E2_MODEL = M.group({
  // Reference tooth selection
  [E2_FIELDS.referenceTooth]: M.group({
    selection: M.question(
      Q.enum({
        options: E2_REFERENCE_TOOTH_KEYS,
        labels: E2_REFERENCE_TEETH,
        required: true,
      }),
      "referenceToothSelection"
    ),
    otherTooth: M.question(
      Q.text({
        placeholder: "Zahnnummer",
        required: true,
        enableWhen: { sibling: "selection", equals: "other" },
      }),
      "referenceToothOther"
    ),
  }),
  // Horizontal overjet (can be negative for anterior cross-bite)
  [E2_FIELDS.horizontalOverjet]: M.question(
    Q.measurement({ unit: "mm", required: true, allowNegative: true }),
    "horizontalOverjet"
  ),
  // Vertical overlap (can be negative for anterior open-bite)
  [E2_FIELDS.verticalOverlap]: M.question(
    Q.measurement({ unit: "mm", required: true, allowNegative: true }),
    "verticalOverlap"
  ),
  // Midline deviation
  [E2_FIELDS.midlineDeviation]: M.group({
    direction: M.question(
      Q.enum({
        options: E2_MIDLINE_DIRECTION_KEYS,
        labels: E2_MIDLINE_DIRECTIONS,
        required: true,
      }),
      "midlineDirection"
    ),
    // mm is only shown and required when direction is not "na"
    mm: M.question(
      Q.measurement({
        unit: "mm",
        required: true,
        enableWhen: { sibling: "direction", notEquals: "na" },
      }),
      "midlineMm"
    ),
  }),
});

// Steps - all fields and per-sub-step definitions for validation
export const E2_STEPS = {
  "e2-all": [
    `${E2_FIELDS.referenceTooth}.selection`,
    `${E2_FIELDS.referenceTooth}.otherTooth`,
    E2_FIELDS.horizontalOverjet,
    E2_FIELDS.verticalOverlap,
    `${E2_FIELDS.midlineDeviation}.direction`,
    `${E2_FIELDS.midlineDeviation}.mm`,
  ],
  "e2-ref": [
    `${E2_FIELDS.referenceTooth}.selection`,
    `${E2_FIELDS.referenceTooth}.otherTooth`,
  ],
  "e2-mid": [
    `${E2_FIELDS.midlineDeviation}.direction`,
    `${E2_FIELDS.midlineDeviation}.mm`,
  ],
  "e2-hov": [E2_FIELDS.horizontalOverjet],
  "e2-vov": [E2_FIELDS.verticalOverlap],
} as const;
