/**
 * InteractiveExamSection - Main container for the interactive E4 examination mode.
 *
 * Layout:
 * - Bilateral head diagrams (patient's right on left of screen)
 * - Region status lists beside each diagram
 * - Inline pain badges below (when region selected)
 * - Progress footer
 */

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Movement } from "../../model/movement";
import { SIDES } from "../../model/side";
import {
  type InteractiveRegion,
  type RegionStatus,
  ALL_INTERACTIVE_REGIONS,
  EMPTY_REGION_STATUS,
  parseRegionId,
  buildRegionId,
} from "./types";
import { useInteractiveExam } from "./useInteractiveExam";
import { HeadDiagram } from "./HeadDiagram";
import { RegionStatusList } from "./RegionStatusList";
import { InlinePainBadges } from "./InlinePainBadges";
import { ProgressFooter } from "./ProgressFooter";

interface InteractiveExamSectionProps {
  /** Movement context (maxUnassistedOpening or maxAssistedOpening) */
  movement: Movement;
  /** Whether the section is disabled (e.g., if terminated) */
  disabled?: boolean;
  /** Optional className */
  className?: string;
}

export function InteractiveExamSection({
  movement,
  disabled = false,
  className,
}: InteractiveExamSectionProps) {
  const {
    selectedRegion,
    regionStatuses,
    handleRegionClick,
    setPain,
    setNoPain,
    setFamiliarPain,
    setNoFamiliarPain,
    setFamiliarHeadache,
    setNoFamiliarHeadache,
    completeAllRegions,
  } = useInteractiveExam({ movement });

  // Get statuses for a specific side
  const getStatusesForSide = useCallback(
    (side: typeof SIDES.LEFT | typeof SIDES.RIGHT): Record<InteractiveRegion, RegionStatus> => {
      const result: Record<InteractiveRegion, RegionStatus> = {} as Record<
        InteractiveRegion,
        RegionStatus
      >;
      for (const region of ALL_INTERACTIVE_REGIONS) {
        const regionId = buildRegionId(side, region);
        result[region] = regionStatuses[regionId] ?? EMPTY_REGION_STATUS;
      }
      return result;
    },
    [regionStatuses]
  );

  // Get selected region for a specific side
  const getSelectedForSide = useCallback(
    (side: typeof SIDES.LEFT | typeof SIDES.RIGHT): InteractiveRegion | null => {
      if (!selectedRegion) return null;
      const { side: selectedSide, region } = parseRegionId(selectedRegion);
      return selectedSide === side ? region : null;
    },
    [selectedRegion]
  );

  // Get status for selected region
  const selectedStatus = selectedRegion
    ? regionStatuses[selectedRegion] ?? EMPTY_REGION_STATUS
    : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Pain localization diagram */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Schmerzlokalisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-8">
            {/* Patient's RIGHT side (displayed on left) */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Rechts (Patient)
              </span>
              <div className="flex items-start gap-2">
                <RegionStatusList
                  regionStatuses={getStatusesForSide(SIDES.RIGHT)}
                  selectedRegion={getSelectedForSide(SIDES.RIGHT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.RIGHT, region)
                  }
                  disabled={disabled}
                />
                <HeadDiagram
                  side={SIDES.RIGHT}
                  regionStatuses={getStatusesForSide(SIDES.RIGHT)}
                  selectedRegion={getSelectedForSide(SIDES.RIGHT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.RIGHT, region)
                  }
                  disabled={disabled}
                />
              </div>
            </div>

            <Separator orientation="vertical" className="h-auto self-stretch" />

            {/* Patient's LEFT side (displayed on right) */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Links (Patient)
              </span>
              <div className="flex items-start gap-2">
                <HeadDiagram
                  side={SIDES.LEFT}
                  regionStatuses={getStatusesForSide(SIDES.LEFT)}
                  selectedRegion={getSelectedForSide(SIDES.LEFT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.LEFT, region)
                  }
                  disabled={disabled}
                />
                <RegionStatusList
                  regionStatuses={getStatusesForSide(SIDES.LEFT)}
                  selectedRegion={getSelectedForSide(SIDES.LEFT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.LEFT, region)
                  }
                  disabled={disabled}
                />
              </div>
            </div>
          </div>

          {/* Inline pain badges - shown when a region is selected */}
          {selectedRegion && selectedStatus && (
            <InlinePainBadges
              selectedRegion={selectedRegion}
              status={selectedStatus}
              onSetPain={setPain}
              onSetNoPain={setNoPain}
              onSetFamiliarPain={setFamiliarPain}
              onSetNoFamiliarPain={setNoFamiliarPain}
              onSetFamiliarHeadache={setFamiliarHeadache}
              onSetNoFamiliarHeadache={setNoFamiliarHeadache}
            />
          )}
        </CardContent>
      </Card>

      {/* Completion button - always visible */}
      <ProgressFooter onComplete={completeAllRegions} />
    </div>
  );
}
