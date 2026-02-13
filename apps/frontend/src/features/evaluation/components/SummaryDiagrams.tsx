/**
 * SummaryDiagrams — Interactive HeadDiagram pair with aggregated region statuses.
 *
 * Renders a left + right HeadDiagram with region colors derived from
 * pre-computed aggregate statuses. Clicking a region fires onRegionClick
 * with the side context included.
 */

import { useCallback } from "react";
import { SIDE_KEYS, type Region, type Side } from "@cmdetect/dc-tmd";
import {
  EMPTY_REGION_STATUS,
  HeadDiagram,
} from "../../examination/components/HeadDiagram";

interface SummaryDiagramsProps {
  regions: readonly Region[];
  selectedSide?: Side;
  selectedRegion?: Region | null;
  onRegionClick?: (side: Side, region: Region) => void;
}

export function SummaryDiagrams({
  regions,
  selectedSide,
  selectedRegion,
  onRegionClick,
}: SummaryDiagramsProps) {
  // Uniform neutral statuses — only the selection highlight matters here
  const emptyStatuses: Partial<Record<Region, typeof EMPTY_REGION_STATUS>> = {};
  for (const r of regions) emptyStatuses[r] = EMPTY_REGION_STATUS;
  const handleRegionClick = useCallback(
    (side: Side) => (region: Region) => {
      onRegionClick?.(side, region);
    },
    [onRegionClick]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-6 sm:gap-10">
        {([...SIDE_KEYS].reverse() as typeof SIDE_KEYS).map((side) => (
          <div key={side} className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">
              {side === "right" ? "Rechts" : "Links"}
            </span>
            <HeadDiagram
              side={side}
              regions={regions}
              regionStatuses={emptyStatuses}
              selectedRegion={selectedSide === side ? selectedRegion : null}
              onRegionClick={handleRegionClick(side)}
              hideBackgroundImages
              className="w-[160px] sm:w-[180px]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
