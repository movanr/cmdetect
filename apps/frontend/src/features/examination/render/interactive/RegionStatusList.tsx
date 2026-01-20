/**
 * RegionStatusList - Clickable list of regions with status indicators.
 *
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import { getLabel } from "../../content/labels";
import {
  type Region,
  type RegionStatus,
  EMPTY_REGION_STATUS,
  REGION_STATE_COLORS,
  REGION_VISUAL_STATES,
  getRegionVisualState,
} from "./types";

interface RegionStatusListProps {
  /** Regions to display */
  regions: readonly Region[];
  /** Status for each region */
  regionStatuses: Record<Region, RegionStatus>;
  /** Currently selected region (if any) */
  selectedRegion?: Region | null;
  /** Callback when a region is clicked */
  onRegionClick: (region: Region) => void;
  /** Optional className */
  className?: string;
  /** Whether interactions are disabled */
  disabled?: boolean;
}

/**
 * Status indicator component using visual state model.
 */
function StatusIndicator({ status }: { status: RegionStatus }) {
  const visualState = getRegionVisualState(status);
  const colors = REGION_STATE_COLORS[visualState];

  switch (visualState) {
    case REGION_VISUAL_STATES.PENDING:
      return <Circle className="h-4 w-4 text-muted-foreground" strokeWidth={2} />;
    case REGION_VISUAL_STATES.NEGATIVE:
      return <Check className="h-4 w-4 text-green-600" strokeWidth={3} />;
    case REGION_VISUAL_STATES.POSITIVE:
      return <div className="h-4 w-4 rounded-full bg-primary" />;
    case REGION_VISUAL_STATES.SIGNIFICANT:
      return <div className="h-4 w-4 rounded-full bg-destructive" />;
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
}: RegionStatusListProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {regions.map((region) => {
        const status = regionStatuses[region] ?? EMPTY_REGION_STATUS;
        const isSelected = selectedRegion === region;
        const visualState = getRegionVisualState(status);
        const colors = REGION_STATE_COLORS[visualState];

        // Get label from centralized content
        const label = getLabel(region);

        return (
          <Button
            key={region}
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRegionClick(region)}
            className={cn(
              "h-8 justify-start gap-2 px-2 text-sm font-normal",
              isSelected && "bg-primary/10 ring-1 ring-primary",
              visualState !== REGION_VISUAL_STATES.PENDING && colors.text
            )}
          >
            <StatusIndicator status={status} />
            <span className="truncate">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
