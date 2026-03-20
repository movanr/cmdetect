/**
 * extract-criteria-items — Build checklist item lists from Criterion definitions.
 *
 * Extracts items from the criterion tree (AND children become rows).
 * Used by InlineCriteriaChecklist to build the item structure.
 */

import {
  getCriterionId,
  getCriterionLabel,
  getCriterionSources,
  isCompositeResult,
  PALPATION_SITES,
  REGIONS,
  SIDES,
  type CriterionResult,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { assessmentKey } from "./assessment-key";

export interface StaticChecklistItem {
  key: string;
  criterionId: string;
  assessmentSide: Side | null;
  assessmentRegion: Region | null;
  assessmentSite: PalpationSite | null;
  label: string;
  detail?: string;
  sources?: string[];
}

export interface ChecklistItem extends StaticChecklistItem {
  result: CriterionResult;
}

interface ChecklistItemScope {
  side: Side | null;
  region: Region | null;
  site: PalpationSite | null;
}

/**
 * Extract checklist items from an evaluation result.
 * AND-composite results are flattened into individual rows.
 */
export function extractChecklistItems(
  result: CriterionResult,
  scope: ChecklistItemScope,
): ChecklistItem[] {
  if (isCompositeResult(result) && result.criterion.type === "and") {
    return result.children.map((child) => {
      const id = getCriterionId(child.criterion)!;
      return {
        key: assessmentKey(id, scope.side, scope.region, scope.site),
        criterionId: id,
        assessmentSide: scope.side,
        assessmentRegion: scope.region,
        assessmentSite: scope.site,
        label: getCriterionLabel(child.criterion)!,
        sources: getCriterionSources(child.criterion),
        result: child,
      };
    });
  }
  const id = getCriterionId(result.criterion)!;
  return [
    {
      key: assessmentKey(id, scope.side, scope.region, scope.site),
      criterionId: id,
      assessmentSide: scope.side,
      assessmentRegion: scope.region,
      assessmentSite: scope.site,
      label: getCriterionLabel(result.criterion)!,
      sources: getCriterionSources(result.criterion),
      result,
    },
  ];
}

/** Add localisation detail strings to checklist items. */
export function addLocalisationDetail(
  items: ChecklistItem[],
  side: Side,
  region: Region,
  site?: PalpationSite,
  includeLocation?: boolean,
): ChecklistItem[] {
  const sideDetail = SIDES[side];
  if (!includeLocation) {
    return items.map((item) => ({ ...item, detail: sideDetail }));
  }
  const locationLabel = site ? PALPATION_SITES[site] : REGIONS[region];
  return items.map((item) => ({ ...item, detail: `${locationLabel}, ${sideDetail}` }));
}
