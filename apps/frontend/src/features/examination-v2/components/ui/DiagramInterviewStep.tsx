import { useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { HeadDiagram } from "../HeadDiagram/head-diagram";
import type { RegionStatus } from "../HeadDiagram/types";
import { RegionPainQuestions } from "./RegionPainQuestions";
import { RegionStatusList } from "./RegionStatusList";
import { SVG_REGIONS, type MovementRegion, type Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import type { IncompleteRegion } from "../../form/validation";
import { getSideLabel } from "../../labels";

export interface DiagramInterviewStepProps {
  instances: QuestionInstance[];
  /** Regions with validation errors (incomplete data) */
  incompleteRegions?: IncompleteRegion[];
}

/**
 * Compute RegionStatus from question instances and form values.
 */
function computeRegionStatus(
  region: MovementRegion,
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
}: DiagramInterviewStepProps) {
  const { watch, getValues } = useFormContext();
  const [selectedRegion, setSelectedRegion] = useState<MovementRegion | null>(null);
  const [selectedSide, setSelectedSide] = useState<Side>("right");

  // Watch all instance paths to trigger re-renders on value changes
  const watchPaths = instances.map((i) => i.path);
  const watchedValues = watch(watchPaths);

  // Compute region statuses for both sides
  // Include watchedValues in deps to recompute when form values change
  const leftStatuses = useMemo(() => {
    const statuses: Partial<Record<MovementRegion, RegionStatus>> = {};
    for (const region of SVG_REGIONS) {
      statuses[region] = computeRegionStatus(region, "left", instances, getValues);
    }
    return statuses;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, getValues, watchedValues]);

  const rightStatuses = useMemo(() => {
    const statuses: Partial<Record<MovementRegion, RegionStatus>> = {};
    for (const region of SVG_REGIONS) {
      statuses[region] = computeRegionStatus(region, "right", instances, getValues);
    }
    return statuses;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances, getValues, watchedValues]);

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

  const handleRegionClick = useCallback((region: MovementRegion, side: Side) => {
    setSelectedRegion(region);
    setSelectedSide(side);
  }, []);

  return (
    <div className="space-y-4">
      {/* Head diagrams with region status lists - lists aligned to card edges */}
      <div className="flex justify-between items-start">
        {/* Right side (patient's right, displayed on left) */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {getSideLabel("right")}
          </span>
          <div className="flex items-start gap-4">
            <RegionStatusList
              regions={SVG_REGIONS}
              regionStatuses={rightStatuses}
              selectedRegion={selectedSide === "right" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "right")}
              incompleteRegions={rightIncomplete}
            />
            <HeadDiagram
              side="right"
              regions={SVG_REGIONS}
              regionStatuses={rightStatuses}
              selectedRegion={selectedSide === "right" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "right")}
              incompleteRegions={rightIncomplete}
            />
          </div>
        </div>

        <Separator orientation="vertical" className="h-auto self-stretch mx-4" />

        {/* Left side (patient's left, displayed on right) */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {getSideLabel("left")}
          </span>
          <div className="flex items-start gap-4">
            <HeadDiagram
              side="left"
              regions={SVG_REGIONS}
              regionStatuses={leftStatuses}
              selectedRegion={selectedSide === "left" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "left")}
              incompleteRegions={leftIncomplete}
            />
            <RegionStatusList
              regions={SVG_REGIONS}
              regionStatuses={leftStatuses}
              selectedRegion={selectedSide === "left" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "left")}
              incompleteRegions={leftIncomplete}
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
