/**
 * DC/TMD Examination Protocol — single declarative definition.
 *
 * Describes examination sections U4–U8 with their sub-steps,
 * badges, data keys, field structures, and German labels.
 * Mirrors the official German examination form structure.
 *
 * Consumers that need a single label (e.g., JOINT_SOUND_LABELS.click)
 * can still import the atoms from ./examination directly.
 * This object composes them into navigable section definitions.
 */

import {
  CLICK_PAIN_LABELS,
  E6_OBSERVER_LABELS,
  E7_OBSERVER_LABELS,
  E8_LOCKING_TYPE_DESCRIPTIONS,
  E8_LOCKING_TYPE_LABELS,
  E8_REDUCIBLE_BY_LABELS,
  JOINT_SOUND_LABELS,
  MOVEMENT_TYPE_LABELS,
  OPENING_TYPE_LABELS,
  type MovementType,
  type OpeningType,
} from "./examination";

export const EXAMINATION_PROTOCOL = {
  e4: {
    label: "Öffnungs- und Schließbewegungen",
    steps: [
      { badge: "U4A", key: "painFree" as OpeningType, label: OPENING_TYPE_LABELS.painFree, hasPainInterview: false },
      { badge: "U4B", key: "maxUnassisted" as OpeningType, label: OPENING_TYPE_LABELS.maxUnassisted, hasPainInterview: true },
      { badge: "U4C", key: "maxAssisted" as OpeningType, label: OPENING_TYPE_LABELS.maxAssisted, hasPainInterview: true },
    ],
  },
  e5: {
    label: "Laterotrusion und Protrusion",
    steps: [
      { badge: "U5A", key: "lateralRight" as MovementType, label: MOVEMENT_TYPE_LABELS.lateralRight, hasPainInterview: true },
      { badge: "U5B", key: "lateralLeft" as MovementType, label: MOVEMENT_TYPE_LABELS.lateralLeft, hasPainInterview: true },
      { badge: "U5C", key: "protrusive" as MovementType, label: MOVEMENT_TYPE_LABELS.protrusive, hasPainInterview: true },
    ],
  },
  e6: {
    label: "Kiefergelenkgeräusche bei Öffnung",
    badge: "U6",
    soundTypes: JOINT_SOUND_LABELS,
    observers: E6_OBSERVER_LABELS,
    clickPainFields: CLICK_PAIN_LABELS,
  },
  e7: {
    label: "Kiefergelenkgeräusche bei Lateralbewegungen",
    badge: "U7",
    soundTypes: JOINT_SOUND_LABELS,
    observers: E7_OBSERVER_LABELS,
    clickPainFields: CLICK_PAIN_LABELS,
  },
  e8: {
    label: "Kieferklemme/-sperre",
    badge: "U8",
    lockingTypes: E8_LOCKING_TYPE_LABELS,
    lockingDescriptions: E8_LOCKING_TYPE_DESCRIPTIONS,
    reducibleByLabels: E8_REDUCIBLE_BY_LABELS,
  },
} as const;

// ── Derived helpers ─────────────────────────────────────────────────

/** E4 steps with pain interview (U4B, U4C — excludes U4A pain-free) */
export const E4_PAIN_STEPS = EXAMINATION_PROTOCOL.e4.steps.filter(
  (s): s is (typeof EXAMINATION_PROTOCOL.e4.steps)[1] | (typeof EXAMINATION_PROTOCOL.e4.steps)[2] =>
    s.hasPainInterview,
);

/** All E5 steps */
export const E5_STEPS = EXAMINATION_PROTOCOL.e5.steps;
