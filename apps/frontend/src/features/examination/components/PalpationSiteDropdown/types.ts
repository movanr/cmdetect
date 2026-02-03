/**
 * Types for the PalpationSiteDropdown component.
 *
 * Provides summary states for palpation sites during pain assessment (E9).
 */

import type { PalpationPainQuestion, PalpationSite, Side, PalpationMode } from "../../model/regions";

/**
 * Summary state for a palpation site's pain assessment.
 * Determines the badge label displayed in the dropdown header.
 */
export type PalpationSiteSummaryState =
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
export const PALPATION_SUMMARY_LABELS: Record<PalpationSiteSummaryState, string> = {
  empty: "",
  "no-pain": "Kein Schmerz",
  "pain-only": "Schmerz",
  "familiar-pain": "Bekannter Schmerz",
  "familiar-headache": "Bekannter Kopfschmerz",
  "both-familiar": "Bek. Schmerz + Kopfschmerz",
  negative: "Keine Übereinstimmung",
};

/**
 * Values needed to compute a palpation site's summary state.
 */
export interface PalpationSitePainValues {
  pain: "yes" | "no" | null;
  familiarPain: "yes" | "no" | null;
  familiarHeadache?: "yes" | "no" | null; // Only for temporalis sites
}

/**
 * Compute the summary state from pain values.
 */
export function computePalpationSummaryState(
  values: PalpationSitePainValues
): PalpationSiteSummaryState {
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

  // Only familiar headache positive (applies to temporalis sites)
  if (hasFamiliarHeadache) {
    return "familiar-headache";
  }

  // For sites with familiarHeadache question, check if it's answered
  if (familiarHeadache === undefined) {
    // Site doesn't have familiarHeadache question (non-temporalis)
    // familiarPain = no, so no match
    return "negative";
  }

  // Site has familiarHeadache but it's not answered yet
  if (familiarHeadache == null) {
    return "pain-only";
  }

  // All familiar questions answered as "no"
  return "negative";
}

/**
 * Represents an incomplete palpation site for validation.
 */
export interface IncompletePalpationSite {
  site: PalpationSite;
  side: Side;
  missingQuestions: PalpationPainQuestion[];
}

/**
 * Configuration for which questions to show in a palpation site dropdown.
 */
export interface PalpationSiteQuestionsConfig {
  site: PalpationSite;
  side: Side;
  /** Palpation mode determines which questions are shown */
  palpationMode: PalpationMode;
  /** Whether to show familiarHeadache question (only for temporalis sites) */
  hasFamiliarHeadache: boolean;
  /** Whether to show spreadingPain question (only for non-TMJ sites) */
  hasSpreadingPain: boolean;
}
