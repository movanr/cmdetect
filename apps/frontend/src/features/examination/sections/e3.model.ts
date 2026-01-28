/**
 * E3: Opening Pattern (Supplemental)
 *
 * Single selection: straight, corrected deviation, or uncorrected deviation (with direction)
 */

import { E3_FIELDS, E3_OPENING_PATTERN_KEYS, E3_OPENING_PATTERNS } from "@cmdetect/dc-tmd";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

export const E3_MODEL = M.group({
  pattern: M.question(
    Q.enum({
      options: E3_OPENING_PATTERN_KEYS,
      labels: E3_OPENING_PATTERNS,
      required: true,
    }),
    E3_FIELDS.openingPattern
  ),
});

// Steps - single field
export const E3_STEPS = {
  "e3-all": ["pattern"],
} as const;
