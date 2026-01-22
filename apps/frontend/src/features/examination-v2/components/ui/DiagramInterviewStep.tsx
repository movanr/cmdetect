import { useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { HeadDiagram } from "../HeadDiagram/head-diagram";
import type { RegionStatus } from "../HeadDiagram/types";
import { RegionPainQuestions } from "./RegionPainQuestions";
import { RegionStatusList } from "./RegionStatusList";
import { BASE_REGIONS, type Region, type Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import type { IncompleteRegion } from "../../form/validation";
import { getSideLabel } from "../../labels";

export interface DiagramInterviewStepProps {
  instances: QuestionInstance[];
  /** Regions with validation errors (incomplete data) */
  incompleteRegions?: IncompleteRegion[];
  /** Regions to display in diagram and list. Defaults to BASE_REGIONS (temporalis, masseter, tmj) */
  regions?: readonly Region[];
}

/**
 * Compute RegionStatus from question instances and form values.
 */
function computeRegionStatus(
  region: Region,
  side: Side,
  instances: QuestionInstance[],
  getValues: (path: string) => unknown
): RegionStatus {
  // Find questions for this region/side
  const regionQuestions = instances.filter(
    (q) => q.context.region === region && q.context.side === side
  );

  const painQ = regionQuestions.find((q) => q.context.painType === "pain");
  const familiarPainQ = regionQuestions.find((q) => q.context.painType === "familiarPain");
  const familiarHeadacheQ = regionQuestions.find(
    (q) => q.context.painType === "familiarHeadache"
  );

  const painValue = painQ ? getValues(painQ.path) : null;
  const familiarPainValue = familiarPainQ ? getValues(familiarPainQ.path) : null;
  const familiarHeadacheValue = familiarHeadacheQ ? getValues(familiarHeadacheQ.path) : null;

  const hasData = painValue != null;
  const isPainPositive = painValue === "yes";
  const hasFamiliarPainData = familiarPainValue != null;
  const hasFamiliarPain = familiarPainValue === "yes";
  const hasFamiliarHeadacheData = familiarHeadacheValue != null;
  const hasFamiliarHeadache = familiarHeadacheValue === "yes";

  // Complete if pain answered and (pain=no OR all follow-ups answered)
  const isComplete =
    hasData &&
    (!isPainPositive ||
      (hasFamiliarPainData && (!familiarHeadacheQ || hasFamiliarHeadacheData)));

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

export function DiagramInterviewStep({
  instances,
  incompleteRegions = [],
  regions = BASE_REGIONS,
}: DiagramInterviewStepProps) {
  const { watch, getValues } = useFormContext();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedSide, setSelectedSide] = useState<Side>("right");

  // Watch all instance paths to trigger re-renders on value changes
  const watchPaths = instances.map((i) => i.path);
  const watchedValues = watch(watchPaths);

  // Compute region statuses for both sides
  // Include watchedValues in deps to recompute when form values change
  const leftStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of regions) {
      statuses[region] = computeRegionStatus(region, "left", instances, getValues);
    }
    return statuses;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, getValues, watchedValues, regions]);

  const rightStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of regions) {
      statuses[region] = computeRegionStatus(region, "right", instances, getValues);
    }
    return statuses;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, getValues, watchedValues, regions]);

  // Filter incomplete regions, excluding any that are now complete
  // This makes validation errors disappear reactively as users fill in values
  const leftIncomplete = useMemo(
    () =>
      incompleteRegions.filter(
        (r) => r.side === "left" && !leftStatuses[r.region]?.isComplete
      ),
    [incompleteRegions, leftStatuses]
  );
  const rightIncomplete = useMemo(
    () =>
      incompleteRegions.filter(
        (r) => r.side === "right" && !rightStatuses[r.region]?.isComplete
      ),
    [incompleteRegions, rightStatuses]
  );

  // Combined filtered list for the selected region panel
  const filteredIncomplete = useMemo(
    () => [...leftIncomplete, ...rightIncomplete],
    [leftIncomplete, rightIncomplete]
  );

  const handleRegionClick = useCallback((region: Region, side: Side) => {
    setSelectedRegion(region);
    setSelectedSide(side);
  }, []);

  return (
    <div className="space-y-4">
      {/* Head diagrams with region status lists - lists on outer edges */}
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6 md:gap-8">
        {/* Right side (patient's right, displayed on left) */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <span className="text-sm font-medium text-muted-foreground text-center md:text-left">
            {getSideLabel("right")}
          </span>
          <div className="flex items-start justify-center md:justify-start gap-3 md:gap-4">
            <RegionStatusList
              regions={regions}
              regionStatuses={rightStatuses}
              selectedRegion={selectedSide === "right" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "right")}
              incompleteRegions={rightIncomplete}
              className="shrink-0"
            />
            <HeadDiagram
              side="right"
              regions={regions}
              regionStatuses={rightStatuses}
              selectedRegion={selectedSide === "right" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "right")}
              incompleteRegions={rightIncomplete}
            />
          </div>
        </div>

        {/* Vertical separator - hidden on mobile/tablet */}
        <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />

        {/* Left side (patient's left, displayed on right) */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <span className="text-sm font-medium text-muted-foreground text-center md:text-end">
            {getSideLabel("left")}
          </span>
          <div className="flex items-start justify-center md:justify-end gap-3 md:gap-4">
            <HeadDiagram
              side="left"
              regions={regions}
              regionStatuses={leftStatuses}
              selectedRegion={selectedSide === "left" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "left")}
              incompleteRegions={leftIncomplete}
            />
            <RegionStatusList
              regions={regions}
              regionStatuses={leftStatuses}
              selectedRegion={selectedSide === "left" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "left")}
              incompleteRegions={leftIncomplete}
              className="shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Pain questions for selected region */}
      {selectedRegion && (
        <RegionPainQuestions
          region={selectedRegion}
          side={selectedSide}
          questions={instances}
          incompleteRegions={filteredIncomplete}
        />
      )}
    </div>
  );
}
