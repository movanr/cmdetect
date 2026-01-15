/**
 * RegionStatusList - Clickable list of regions with status indicators.
 *
 * Displays the 5 interactive regions with visual feedback:
 * - ○ Gray circle: Not yet examined (pending)
 * - ● Red filled: Clinically significant (familiar pain or familiar headache)
 * - ✓ Green check: Completed, no clinical significance
 * - 🧠 Brain icon: Familiar headache positive (Temporalis only)
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Circle, Zap } from "lucide-react";
import {
  type InteractiveRegion,
  type RegionStatus,
  INTERACTIVE_REGIONS,
  ALL_INTERACTIVE_REGIONS,
  EMPTY_REGION_STATUS,
} from "./types";

/**
 * Labels for interactive regions.
 */
const INTERACTIVE_REGION_LABELS: Record<InteractiveRegion, string> = {
  [INTERACTIVE_REGIONS.TEMPORALIS]: "Temporalis",
  [INTERACTIVE_REGIONS.MASSETER]: "Masseter",
  [INTERACTIVE_REGIONS.TMJ]: "Kiefergelenk",
  [INTERACTIVE_REGIONS.NON_MAST]: "Nicht-Kau",
  [INTERACTIVE_REGIONS.OTHER_MAST]: "Andere Kaumusk.",
};

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
 * Check if region has clinically significant findings (familiar pain or familiar headache).
 */
function isClinicallySignificant(status: RegionStatus): boolean {
  return status.hasFamiliarPain || status.hasFamiliarHeadache;
}

/**
 * Status indicator component.
 */
function StatusIndicator({ status }: { status: RegionStatus }) {
  if (!status.hasData) {
    // Pending - empty circle
    return (
      <Circle
        className="h-4 w-4 text-muted-foreground"
        strokeWidth={2}
      />
    );
  }

  if (status.isComplete) {
    if (isClinicallySignificant(status)) {
      // Clinically significant - filled red circle
      return (
        <div className="h-4 w-4 rounded-full bg-destructive" />
      );
    }
    // No clinical significance - green checkmark
    return (
      <Check
        className="h-4 w-4 text-green-600"
        strokeWidth={3}
      />
    );
  }

  // In progress (has data but not complete) - partially filled
  return (
    <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20" />
  );
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

        const clinicallySignificant = isClinicallySignificant(status);

        return (
          <Button
            key={region}
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRegionClick(region)}
            className={cn(
              "h-8 justify-start gap-2 px-2 text-sm font-normal",
              isSelected && "bg-primary/10 ring-1 ring-primary",
              status.isComplete && clinicallySignificant && "text-destructive",
              status.isComplete && !clinicallySignificant && "text-green-700"
            )}
          >
            <StatusIndicator status={status} />
            <span className="truncate">
              {INTERACTIVE_REGION_LABELS[region]}
            </span>
            <HeadacheIcon status={status} />
          </Button>
        );
      })}
    </div>
  );
}
