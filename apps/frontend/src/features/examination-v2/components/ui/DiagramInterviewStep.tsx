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
  watch(watchPaths);

  // Compute region statuses for both sides
  const leftStatuses = useMemo(() => {
    const statuses: Partial<Record<MovementRegion, RegionStatus>> = {};
    for (const region of SVG_REGIONS) {
      statuses[region] = computeRegionStatus(region, "left", instances, getValues);
    }
    return statuses;
  }, [instances, getValues]);

  const rightStatuses = useMemo(() => {
    const statuses: Partial<Record<MovementRegion, RegionStatus>> = {};
    for (const region of SVG_REGIONS) {
      statuses[region] = computeRegionStatus(region, "right", instances, getValues);
    }
    return statuses;
  }, [instances, getValues]);

  // Filter incomplete regions by side
  const leftIncomplete = useMemo(
    () => incompleteRegions.filter((r) => r.side === "left"),
    [incompleteRegions]
  );
  const rightIncomplete = useMemo(
    () => incompleteRegions.filter((r) => r.side === "right"),
    [incompleteRegions]
  );

  const handleRegionClick = useCallback((region: MovementRegion, side: Side) => {
    setSelectedRegion(region);
    setSelectedSide(side);
  }, []);

  return (
    <div className="space-y-4">
      {/* Head diagrams with region status lists */}
      <div className="flex justify-center gap-8">
        {/* Right side (patient's right, displayed on left) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {getSideLabel("right")}
          </span>
          <div className="flex items-start gap-2">
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
            />
          </div>
        </div>

        <Separator orientation="vertical" className="h-auto self-stretch" />

        {/* Left side (patient's left, displayed on right) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {getSideLabel("left")}
          </span>
          <div className="flex items-start gap-2">
            <HeadDiagram
              side="left"
              regions={SVG_REGIONS}
              regionStatuses={leftStatuses}
              selectedRegion={selectedSide === "left" ? selectedRegion : null}
              onRegionClick={(r) => handleRegionClick(r, "left")}
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
        />
      )}
    </div>
  );
}
