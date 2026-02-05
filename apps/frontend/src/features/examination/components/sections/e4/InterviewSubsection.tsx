import { Separator } from "@/components/ui/separator";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import type { IncompleteRegion } from "../../../form/validation";
import type { Region, Side } from "../../../model/regions";
import type { QuestionInstance } from "../../../projections/to-instances";
import { HeadDiagram } from "../../HeadDiagram/head-diagram";
import { type RegionStatus } from "../../HeadDiagram/types";
import { RegionDropdown } from "../../RegionDropdown";
import type { ExpandedState } from "./types";

/**
 * Compute RegionStatus for a single region/side from form values.
 */
function computeRegionStatus(
  region: Region,
  side: Side,
  instances: QuestionInstance[],
  getValue: (path: string) => unknown
): RegionStatus {
  const regionInstances = instances.filter(
    (i) => i.context.region === region && i.context.side === side
  );

  const painInst = regionInstances.find((i) => i.context.painType === "pain");
  const familiarPainInst = regionInstances.find((i) => i.context.painType === "familiarPain");
  const familiarHeadacheInst = regionInstances.find(
    (i) => i.context.painType === "familiarHeadache"
  );

  const painValue = painInst ? (getValue(painInst.path) as string | null) : null;
  const familiarPainValue = familiarPainInst
    ? (getValue(familiarPainInst.path) as string | null)
    : null;
  const familiarHeadacheValue = familiarHeadacheInst
    ? (getValue(familiarHeadacheInst.path) as string | null)
    : null;

  const hasData = painValue != null;
  const isPainPositive = painValue === "yes";
  const hasFamiliarPainData = familiarPainValue != null;
  const hasFamiliarPain = familiarPainValue === "yes";
  const hasFamiliarHeadacheData = familiarHeadacheValue != null;
  const hasFamiliarHeadache = familiarHeadacheValue === "yes";

  // Complete if:
  // - pain = no, OR
  // - pain = yes AND familiarPain answered AND (no familiarHeadache question OR familiarHeadache answered)
  let isComplete = false;
  if (hasData) {
    if (!isPainPositive) {
      isComplete = true;
    } else {
      const hasFamiliarHeadacheQuestion = familiarHeadacheInst != null;
      isComplete = hasFamiliarPainData && (!hasFamiliarHeadacheQuestion || hasFamiliarHeadacheData);
    }
  }

  return {
    hasData,
    isPainPositive,
    hasFamiliarPainData,
    hasFamiliarPain,
    hasFamiliarHeadacheData,
    hasFamiliarHeadache,
    isComplete,
  };
}

export interface InterviewSubsectionProps {
  instances: QuestionInstance[];
  regions: readonly Region[];
  expanded: ExpandedState;
  onExpandChange: (side: Side, region: Region | null) => void;
  incompleteRegions: IncompleteRegion[];
}

export function InterviewSubsection({
  instances,
  regions,
  expanded,
  onExpandChange,
  incompleteRegions,
}: InterviewSubsectionProps) {
  const { getValues, watch } = useFormContext();

  // Watch all instance paths to trigger re-renders
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Compute region statuses for the diagram
  const computeStatuses = useCallback(
    (side: Side): Partial<Record<Region, RegionStatus>> => {
      const statuses: Partial<Record<Region, RegionStatus>> = {};
      for (const region of regions) {
        statuses[region] = computeRegionStatus(region, side, instances, getValues);
      }
      return statuses;
    },
    [regions, instances, getValues]
  );

  // Get instances for a specific region/side
  const getRegionInstances = useCallback(
    (region: Region, side: Side) =>
      instances.filter((i) => i.context.region === region && i.context.side === side),
    [instances]
  );

  // Get incomplete region for a specific region/side
  const getIncompleteRegion = useCallback(
    (region: Region, side: Side) =>
      incompleteRegions.find((r) => r.region === region && r.side === side),
    [incompleteRegions]
  );

  // Handle diagram region click - toggle dropdown
  const handleRegionClick = useCallback(
    (side: Side) => (region: Region) => {
      const currentExpanded = expanded[side];
      // Toggle: if same region, close; otherwise open clicked region
      onExpandChange(side, currentExpanded === region ? null : region);
    },
    [expanded, onExpandChange]
  );

  // Handle dropdown expansion change
  const handleDropdownExpand = useCallback(
    (side: Side, region: Region) => (isExpanded: boolean) => {
      onExpandChange(side, isExpanded ? region : null);
    },
    [onExpandChange]
  );

  // Filter incomplete regions by side
  const getIncompleteRegionsForSide = useCallback(
    (side: Side) => incompleteRegions.filter((r) => r.side === side),
    [incompleteRegions]
  );

  // Render a single side panel
  const renderSidePanel = (side: Side) => {
    const sideLabel = side === "right" ? "Rechte Seite" : "Linke Seite";
    const statuses = computeStatuses(side);
    const sideIncompleteRegions = getIncompleteRegionsForSide(side);

    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{sideLabel}</span>

        {/* HeadDiagram */}
        <HeadDiagram
          side={side}
          regions={regions}
          regionStatuses={statuses}
          selectedRegion={expanded[side]}
          onRegionClick={handleRegionClick(side)}
          incompleteRegions={sideIncompleteRegions}
        />

        {/* RegionDropdowns */}
        <div className="w-80 space-y-2">
          {regions.map((region) => (
            <RegionDropdown
              key={region}
              region={region}
              side={side}
              instances={getRegionInstances(region, side)}
              isExpanded={expanded[side] === region}
              onExpandChange={handleDropdownExpand(side, region)}
              incompleteRegion={getIncompleteRegion(region, side)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-start gap-8 md:gap-16">
      {renderSidePanel("right")}
      <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />
      {renderSidePanel("left")}
    </div>
  );
}
