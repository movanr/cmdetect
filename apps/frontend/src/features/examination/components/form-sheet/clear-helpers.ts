import type { UseFormSetValue, FieldValues } from "react-hook-form";
import {
  E10_PAIN_QUESTIONS,
  E10_SITE_KEYS,
  PALPATION_SITE_KEYS,
  REGION_KEYS,
  getMovementPainQuestions,
  getPalpationPainQuestions,
} from "../../model/regions";

const SIDES = ["right", "left"] as const;
type Side = (typeof SIDES)[number];

/**
 * Clear all bilateral pain-interview answers under a movement prefix
 * (e.g. "e4.maxUnassisted"). Mirrors InterviewContent.tsx clearing behavior
 * so form-sheet and wizard stay in sync when `interviewRefused` is toggled.
 */
export function clearMovementPainInterview<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  prefix: string
): void {
  for (const side of SIDES) {
    for (const region of REGION_KEYS) {
      for (const q of getMovementPainQuestions(region)) {
        setValue(
          `${prefix}.${side}.${region}.${q}` as never,
          null as never,
          { shouldDirty: true }
        );
      }
    }
  }
}

/** Clear all E9 palpation answers for one side. */
export function clearE9PalpationSide<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  side: Side
): void {
  for (const site of PALPATION_SITE_KEYS) {
    for (const q of getPalpationPainQuestions(site)) {
      setValue(
        `e9.${side}.${site}.${q}` as never,
        null as never,
        { shouldDirty: true }
      );
    }
  }
}

/** Clear all E10 supplemental palpation answers for one side. */
export function clearE10PalpationSide<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  side: Side
): void {
  for (const site of E10_SITE_KEYS) {
    for (const q of E10_PAIN_QUESTIONS) {
      setValue(
        `e10.${side}.${site}.${q}` as never,
        null as never,
        { shouldDirty: true }
      );
    }
  }
}
