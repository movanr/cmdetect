/**
 * Hook for form sheet sections: single useWatch per section.
 *
 * Replaces ~N individual useWatch subscriptions (one per FsYesNo) with 1 subscription.
 * Returns a stable getValue function that grids/primitives use to read field values.
 */

import { useCallback } from "react";
import { useWatch } from "react-hook-form";

export type GetValue = (path: string) => unknown;

/**
 * Subscribe to all field paths for a form sheet section at once.
 *
 * @param paths - Static array of field paths (compute at module level via createSectionPathLookup)
 * @param indexMap - Map from path → index in the paths array (for O(1) lookup)
 */
export function useSectionValues(
  paths: string[],
  indexMap: Map<string, number>
): GetValue {
  const values = useWatch({ name: paths });

  return useCallback(
    (path: string) => {
      const idx = indexMap.get(path);
      return idx !== undefined ? values[idx] : undefined;
    },
    [indexMap, values]
  );
}
