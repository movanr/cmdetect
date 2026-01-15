/**
 * RegionStatusList - Clickable list of regions with status indicators.
 *
 * Displays the 5 interactive regions with visual feedback:
 * - ○ Gray circle: Pending (no data)
 * - ✓ Green check: Negative (pain = no)
 * - ● Blue filled: Positive (pain = yes, no significant findings)
 * - ● Red filled: Significant (familiar pain or headache = yes)
 * - ⚡ Zap icon: Familiar headache positive
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Circle, Zap } from "lucide-react";
import { getLabel } from "../../content/labels";
import { PAIN_TYPES } from "../../model/pain";
import {
  type InteractiveRegion,
  type RegionStatus,
  ALL_INTERACTIVE_REGIONS,
  EMPTY_REGION_STATUS,
  REGION_STATE_COLORS,
  REGION_VISUAL_STATES,
  getRegionVisualState,
  mapInteractiveToRegion,
} from "./types";

interface RegionStatusListProps {
  /** Status for each region */
  regionStatuses: Record<InteractiveRegion, RegionStatus>;
  /** Currently selected region (if any) */
  selectedRegion?: InteractiveRegion | null;
  /** Callback when a region is clicked */
  onRegionClick: (region: InteractiveRegion) => void;
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

/**
 * Small headache icon shown when familiar headache is positive.
 */
function HeadacheIcon({ status }: { status: RegionStatus }) {
  if (!status.hasFamiliarHeadache) {
    return null;
  }

  const label = getLabel(PAIN_TYPES.FAMILIAR_HEADACHE);
  return (
    <Zap className="h-3.5 w-3.5 text-destructive ml-auto" aria-label={label} />
  );
}

export function RegionStatusList({
  regionStatuses,
  selectedRegion,
  onRegionClick,
  className,
  disabled = false,
}: RegionStatusListProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {ALL_INTERACTIVE_REGIONS.map((region) => {
        const status = regionStatuses[region] ?? EMPTY_REGION_STATUS;
        const isSelected = selectedRegion === region;
        const visualState = getRegionVisualState(status);
        const colors = REGION_STATE_COLORS[visualState];

        // Get label from centralized content
        const regionConstant = mapInteractiveToRegion(region);
        const label = getLabel(regionConstant);

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
            <HeadacheIcon status={status} />
          </Button>
        );
      })}
    </div>
  );
}
