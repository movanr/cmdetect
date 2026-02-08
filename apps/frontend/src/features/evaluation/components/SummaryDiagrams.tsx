/**
 * SummaryDiagrams — Read-only HeadDiagram pair with aggregated diagnosis results.
 *
 * Renders a left + right HeadDiagram in read-only mode, with region colors
 * derived from aggregated CriteriaLocationResult across all diagnoses in a section.
 */

import { useCallback } from "react";
import {
  SIDE_KEYS,
  type CriteriaLocationResult,
  type DiagnosisEvaluationResult,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import {
  HeadDiagram,
  EMPTY_REGION_STATUS,
  type RegionStatus,
} from "../../examination/components/HeadDiagram";

interface SummaryDiagramsProps {
  results: DiagnosisEvaluationResult[];
  regions: readonly Region[];
}

/**
 * Map aggregated CriteriaLocationResults to a HeadDiagram RegionStatus.
 *
 * - positive location → blue (familiar pain positive)
 * - negative location → dark gray (complete, no findings)
 * - pending location → light gray (no data)
 */
function toRegionStatus(
  allLocationResults: CriteriaLocationResult[],
  side: Side,
  region: Region
): RegionStatus {
  const matches = allLocationResults.filter(
    (r) => r.side === side && r.region === region
  );
  if (matches.length === 0) return EMPTY_REGION_STATUS;

  const hasPositive = matches.some((r) => r.status === "positive");
  const hasPending = matches.some((r) => r.status === "pending");
  const hasData = matches.some((r) => r.status !== "pending");

  return {
    hasData,
    isPainPositive: hasPositive,
    hasFamiliarPainData: hasData,
    hasFamiliarPain: hasPositive,
    hasFamiliarHeadacheData: false,
    hasFamiliarHeadache: false,
    isComplete: !hasPending,
  };
}

const LEGEND_ITEMS = [
  { label: "Positiv", className: "bg-blue-400" },
  { label: "Negativ", className: "bg-zinc-400" },
  { label: "Ausstehend", className: "bg-zinc-300" },
];

// No-op for disabled diagrams
const noop = () => {};

export function SummaryDiagrams({ results, regions }: SummaryDiagramsProps) {
  // Collect all location results from all diagnoses
  const allLocationResults = results.flatMap((r) => r.locationResults);

  // Build region statuses per side
  const buildStatuses = useCallback(
    (side: Side): Partial<Record<Region, RegionStatus>> => {
      const statuses: Partial<Record<Region, RegionStatus>> = {};
      for (const region of regions) {
        statuses[region] = toRegionStatus(allLocationResults, side, region);
      }
      return statuses;
    },
    [allLocationResults, regions]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 sm:gap-4">
        {([...SIDE_KEYS].reverse() as typeof SIDE_KEYS).map((side) => (
          <div key={side} className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">
              {side === "right" ? "Rechts" : "Links"}
            </span>
            <HeadDiagram
              side={side}
              regions={regions}
              regionStatuses={buildStatuses(side)}
              onRegionClick={noop}
              disabled
              className="w-[160px] sm:w-[180px]"
            />
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {LEGEND_ITEMS.map(({ label, className }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${className}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
