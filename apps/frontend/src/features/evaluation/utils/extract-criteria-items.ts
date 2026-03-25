/**
 * extract-criteria-items — Build checklist item lists from Criterion definitions.
 *
 * Extracts items from the criterion tree (AND children become rows).
 * Used by InlineCriteriaChecklist to build the item structure.
 */

import {
  getCriterionHint,
  getCriterionId,
  getCriterionLabel,
  getCriterionReferenceLabel,
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
  hint?: string;
}

export interface ChecklistItem extends StaticChecklistItem {
  result: CriterionResult;
  /** True when this item is one of several OR-alternatives (show "ODER" separator between them) */
  isAlternative?: boolean;
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
  // Reference label: show as a single item with the reference text, don't expand
  const refLabel = getCriterionReferenceLabel(result.criterion);
  if (refLabel) {
    const id = getCriterionId(result.criterion) ?? "ref";
    return [
      {
        key: assessmentKey(id, scope.side, scope.region, scope.site),
        criterionId: id,
        assessmentSide: scope.side,
        assessmentRegion: scope.region,
        assessmentSite: scope.site,
        label: refLabel,
        sources: getCriterionSources(result.criterion),
        hint: getCriterionHint(result.criterion),
        result,
      },
    ];
  }

  if (isCompositeResult(result)) {
    // AND: flatten children that have their own metadata into separate rows.
    // If all children have ids, recurse into each. Otherwise treat the AND
    // as a single item (its own id/label covers the grouped children).
    if (result.criterion.type === "and") {
      const allChildrenNamed = result.children.every((c) => getCriterionId(c.criterion));
      if (allChildrenNamed) {
        return result.children.flatMap((child) => extractChecklistItems(child, scope));
      }
    }
    // OR with named children: show each alternative with "ODER" separator
    if (
      result.criterion.type === "or" &&
      result.children.length > 1 &&
      result.children.every((c) => getCriterionId(c.criterion))
    ) {
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
          hint: getCriterionHint(child.criterion),
          result: child,
          isAlternative: true,
        };
      });
    }
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
      hint: getCriterionHint(result.criterion),
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
