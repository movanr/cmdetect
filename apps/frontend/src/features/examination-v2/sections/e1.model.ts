/**
 * E1: Pain & Headache Location
 *
 * E1a: Location of Pain (Last 30 days) - bilateral
 * E1b: Location of Headache (Last 30 days) - bilateral
 */

import { M } from "../model/nodes";
import { Q } from "../model/primitives";

// Pain location options for E1a
const PAIN_LOCATION_OPTIONS = [
  "none",
  "temporalis",
  "masseter",
  "tmj",
  "otherMuscles",
  "nonMast",
] as const;

const PAIN_LOCATION_LABELS: Record<(typeof PAIN_LOCATION_OPTIONS)[number], string> = {
  none: "Keine",
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "Kiefergelenk",
  otherMuscles: "Andere Kaumuskulatur",
  nonMast: "Andere Strukturen",
};

// Headache location options for E1b
const HEADACHE_LOCATION_OPTIONS = ["none", "temporal", "other"] as const;

const HEADACHE_LOCATION_LABELS: Record<(typeof HEADACHE_LOCATION_OPTIONS)[number], string> = {
  none: "Keine",
  temporal: "Temporal",
  other: "Andere",
};

export const E1_MODEL = M.group({
  // E1a: Pain location (bilateral)
  painLocation: M.group({
    right: M.question(
      Q.checkboxGroup({
        options: PAIN_LOCATION_OPTIONS,
        labels: PAIN_LOCATION_LABELS,
      }),
      "painLocationRight"
    ),
    left: M.question(
      Q.checkboxGroup({
        options: PAIN_LOCATION_OPTIONS,
        labels: PAIN_LOCATION_LABELS,
      }),
      "painLocationLeft"
    ),
  }),
  // E1b: Headache location (bilateral)
  headacheLocation: M.group({
    right: M.question(
      Q.checkboxGroup({
        options: HEADACHE_LOCATION_OPTIONS,
        labels: HEADACHE_LOCATION_LABELS,
      }),
      "headacheLocationRight"
    ),
    left: M.question(
      Q.checkboxGroup({
        options: HEADACHE_LOCATION_OPTIONS,
        labels: HEADACHE_LOCATION_LABELS,
      }),
      "headacheLocationLeft"
    ),
  }),
});

// Steps - all fields shown together in a single step
export const E1_STEPS = {
  "e1-all": [
    "painLocation.right",
    "painLocation.left",
    "headacheLocation.right",
    "headacheLocation.left",
  ],
} as const;

// Export types for use in labels
export type PainLocationOption = (typeof PAIN_LOCATION_OPTIONS)[number];
export type HeadacheLocationOption = (typeof HEADACHE_LOCATION_OPTIONS)[number];
export { PAIN_LOCATION_OPTIONS, PAIN_LOCATION_LABELS, HEADACHE_LOCATION_OPTIONS, HEADACHE_LOCATION_LABELS };
