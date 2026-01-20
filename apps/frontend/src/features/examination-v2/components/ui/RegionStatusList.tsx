/**
 * RegionStatusList - Clickable list of regions with status indicators.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Circle } from "lucide-react";
import type { IncompleteRegion } from "../../form/validation";
import { getRegionLabel } from "../../labels";
import type { MovementRegion } from "../../model/regions";
import {
  REGION_STATE_COLORS,
  REGION_STATE_COLORS_SELECTED,
  REGION_VISUAL_STATES,
  getRegionVisualState,
  type RegionStatus,
} from "../HeadDiagram/types";

export interface RegionStatusListProps {
  /** Regions to display */
  regions: readonly MovementRegion[];
  /** Status for each region */
  regionStatuses: Partial<Record<MovementRegion, RegionStatus>>;
  /** Currently selected region (if any) */
  selectedRegion?: MovementRegion | null;
  /** Callback when a region is clicked */
  onRegionClick: (region: MovementRegion) => void;
  /** Optional className */
  className?: string;
  /** Whether interactions are disabled */
  disabled?: boolean;
  /** Regions with validation errors */
  incompleteRegions?: IncompleteRegion[];
}

const EMPTY_STATUS: RegionStatus = {
  hasData: false,
  isPainPositive: false,
  hasFamiliarPainData: false,
  hasFamiliarPain: false,
  hasFamiliarHeadacheData: false,
  hasFamiliarHeadache: false,
  isComplete: false,
};

/**
 * Status indicator component using visual state model.
 * - Pending: light gray circle outline (no data)
 * - Undefined: light gray circle outline (pain=yes, familiar not yet answered)
 * - Negative: dark gray check (complete, no significant findings)
 * - Positive: blue filled circle (familiar pain confirmed)
 */
function StatusIndicator({ status }: { status: RegionStatus }) {
  const visualState = getRegionVisualState(status);
  const colors = REGION_STATE_COLORS[visualState];

  switch (visualState) {
    case REGION_VISUAL_STATES.PENDING:
    case REGION_VISUAL_STATES.UNDEFINED:
      // Light gray = incomplete
      return <Circle className="h-4 w-4 text-zinc-300" strokeWidth={2} />;
    case REGION_VISUAL_STATES.NEGATIVE:
      // Dark gray = complete, no significant findings
      return <Check className="h-4 w-4 text-zinc-500" strokeWidth={3} />;
    case REGION_VISUAL_STATES.POSITIVE:
      // Blue = significant finding (familiar pain confirmed)
      return <div className="h-4 w-4 rounded-full bg-blue-500" />;
    default:
      return <Circle className={cn("h-4 w-4", colors.text)} strokeWidth={2} />;
  }
}

export function RegionStatusList({
  regions,
  regionStatuses,
  selectedRegion,
  onRegionClick,
  className,
  disabled = false,
  incompleteRegions = [],
}: RegionStatusListProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {regions.map((region) => {
        const status = regionStatuses[region] ?? EMPTY_STATUS;
        const isSelected = selectedRegion === region;
        const visualState = getRegionVisualState(status);
        const colors = REGION_STATE_COLORS[visualState];
        const incomplete = incompleteRegions.find((r) => r.region === region);

        const label = getRegionLabel(region);

        const selectedColors = REGION_STATE_COLORS_SELECTED[visualState];

        return (
          <div key={region} className="flex flex-col">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onRegionClick(region)}
              className={cn(
                "h-8 justify-start gap-2 px-2 text-sm font-normal",
                isSelected && selectedColors.bgClass,
                isSelected && selectedColors.ringClass,
                visualState !== REGION_VISUAL_STATES.PENDING && colors.text,
                incomplete && !isSelected && "ring-1 ring-destructive"
              )}
            >
              <StatusIndicator status={status} />
              <span className="truncate">{label}</span>
              {incomplete && <AlertCircle className="h-3.5 w-3.5 text-destructive ml-auto" />}
            </Button>
            {incomplete && (
              <span className="text-xs text-destructive pl-6 pb-1">
                {incomplete.missingPain ? "Schmerzangabe fehlt" : "Bitte vervollständigen"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
