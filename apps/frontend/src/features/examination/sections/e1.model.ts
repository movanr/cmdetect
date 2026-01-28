/**
 * E1: Pain & Headache Location
 *
 * E1a: Location of Pain (Last 30 days) - bilateral
 * E1b: Location of Headache (Last 30 days) - bilateral
 */

import {
  E1_FIELDS,
  E1_HEADACHE_LOCATION_KEYS,
  E1_HEADACHE_LOCATIONS,
  E1_PAIN_LOCATION_KEYS,
  E1_PAIN_LOCATIONS,
} from "@cmdetect/dc-tmd";
import { M } from "../model/nodes";
import { Q } from "../model/primitives";

export const E1_MODEL = M.group({
  // E1a: Pain location (bilateral)
  [E1_FIELDS.painLocation]: M.group({
    right: M.question(
      Q.checkboxGroup({
        options: E1_PAIN_LOCATION_KEYS,
        labels: E1_PAIN_LOCATIONS,
      }),
      "painLocationRight"
    ),
    left: M.question(
      Q.checkboxGroup({
        options: E1_PAIN_LOCATION_KEYS,
        labels: E1_PAIN_LOCATIONS,
      }),
      "painLocationLeft"
    ),
  }),
  // E1b: Headache location (bilateral)
  [E1_FIELDS.headacheLocation]: M.group({
    right: M.question(
      Q.checkboxGroup({
        options: E1_HEADACHE_LOCATION_KEYS,
        labels: E1_HEADACHE_LOCATIONS,
      }),
      "headacheLocationRight"
    ),
    left: M.question(
      Q.checkboxGroup({
        options: E1_HEADACHE_LOCATION_KEYS,
        labels: E1_HEADACHE_LOCATIONS,
      }),
      "headacheLocationLeft"
    ),
  }),
});

// Steps - all fields shown together in a single step
export const E1_STEPS = {
  "e1-all": [
    `${E1_FIELDS.painLocation}.right`,
    `${E1_FIELDS.painLocation}.left`,
    `${E1_FIELDS.headacheLocation}.right`,
    `${E1_FIELDS.headacheLocation}.left`,
  ],
} as const;
