/**
 * RegionStatusList - Clickable list of regions with status indicators.
 *
 * Displays interactive regions with visual feedback:
 * - ○ Gray circle: Pending (no data)
 * - ✓ Green check: Negative (pain = no)
 * - ● Blue filled: Positive (pain = yes, no significant findings)
 * - ● Red filled: Significant (familiar pain or headache = yes)
 * - ⚡ Zap icon: Familiar headache positive
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Circle, Zap } from "lucide-react";
import { getRegionLabel } from "../../labels";
import type { MovementRegion } from "../../model/regions";
import type { IncompleteRegion } from "../../form/validation";
import {
  REGION_STATE_COLORS,
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

  return (
    <Zap
      className="h-3.5 w-3.5 text-destructive ml-auto"
      aria-label="Bekannte Kopfschmerzen"
    />
  );
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
                isSelected && "bg-primary/10 ring-1 ring-primary",
                visualState !== REGION_VISUAL_STATES.PENDING && colors.text,
                incomplete && "ring-1 ring-destructive"
              )}
            >
              <StatusIndicator status={status} />
              <span className="truncate">{label}</span>
              <HeadacheIcon status={status} />
              {incomplete && (
                <AlertCircle className="h-3.5 w-3.5 text-destructive ml-auto" />
              )}
            </Button>
            {incomplete && (
              <span className="text-xs text-destructive pl-6 pb-1">
                {incomplete.missingPain
                  ? "Schmerzangabe fehlt"
                  : "Bitte vervollständigen"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
