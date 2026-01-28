/**
 * Types for the RegionDropdown component.
 *
 * Provides summary states for anatomical regions during pain assessment.
 */

import type { Region, Side } from "../../model/regions";

/**
 * Summary state for a region's pain assessment.
 * Determines the badge label displayed in the dropdown header.
 */
export type RegionSummaryState =
  | "empty" // pain=null → no badge
  | "no-pain" // pain=no → "Kein Schmerz"
  | "pain-only" // pain=yes, familiar=null → "Schmerz" (incomplete, error state)
  | "familiar-pain" // familiarPain=yes → "Bekannter Schmerz"
  | "familiar-headache" // familiarHeadache=yes → "Bekannter Kopfschmerz"
  | "both-familiar" // both=yes → "Bek. Schmerz + Kopfschmerz"
  | "negative"; // pain=yes, all familiar=no → "Keine Übereinstimmung"

/**
 * German labels for each summary state.
 */
export const SUMMARY_LABELS: Record<RegionSummaryState, string> = {
  empty: "",
  "no-pain": "Kein Schmerz",
  "pain-only": "Schmerz",
  "familiar-pain": "Bekannter Schmerz",
  "familiar-headache": "Bekannter Kopfschmerz",
  "both-familiar": "Bek. Schmerz + Kopfschmerz",
  negative: "Keine Übereinstimmung",
};

/**
 * Values needed to compute a region's summary state.
 */
export interface RegionPainValues {
  pain: "yes" | "no" | null;
  familiarPain: "yes" | "no" | null;
  familiarHeadache?: "yes" | "no" | null; // Only for temporalis
}

/**
 * Compute the summary state from pain values.
 */
export function computeSummaryState(values: RegionPainValues): RegionSummaryState {
  const { pain, familiarPain, familiarHeadache } = values;

  // No pain data yet
  if (pain == null) {
    return "empty";
  }

  // No pain reported
  if (pain === "no") {
    return "no-pain";
  }

  // Pain = yes, check familiar pain answers
  if (familiarPain == null) {
    // Familiar pain not yet answered (familiarHeadache is conditional, checked later)
    return "pain-only";
  }

  const hasFamiliarPain = familiarPain === "yes";
  const hasFamiliarHeadache = familiarHeadache === "yes";

  // Both familiar pain and familiar headache positive
  if (hasFamiliarPain && hasFamiliarHeadache) {
    return "both-familiar";
  }

  // Only familiar pain positive
  if (hasFamiliarPain) {
    return "familiar-pain";
  }

  // Only familiar headache positive (applies to temporalis)
  if (hasFamiliarHeadache) {
    return "familiar-headache";
  }

  // For regions with familiarHeadache question, check if it's answered
  if (familiarHeadache === undefined) {
    // Region doesn't have familiarHeadache question (non-temporalis)
    // familiarPain = no, so no match
    return "negative";
  }

  // Region has familiarHeadache but it's not answered yet
  if (familiarHeadache == null) {
    return "pain-only";
  }

  // All familiar questions answered as "no"
  return "negative";
}

/**
 * Props for a single pain question row inside the dropdown.
 */
export interface PainQuestionRowProps {
  label: string;
  path: string;
  disabled: boolean;
  hasError?: boolean;
}

/**
 * Configuration for which questions to show in a region dropdown.
 */
export interface RegionQuestionsConfig {
  region: Region;
  side: Side;
  /** Whether to show familiarHeadache question (only for temporalis) */
  hasFamiliarHeadache: boolean;
}
