/**
 * InlinePainBadges - Pain assessment badges for selected region.
 *
 * Layout: [Region Label] Schmerz: [Nein] [Ja] | [Bekannter Schmerz] [Bekannter Kopfschmerz]
 *
 * Selecting familiar pain/headache automatically sets pain=yes.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Side } from "../../model/side";
import {
  type InteractiveRegion,
  type RegionId,
  type RegionStatus,
  INTERACTIVE_REGIONS,
  parseRegionId,
} from "./types";

const SIDE_LABELS: Record<Side, string> = {
  left: "Linke Seite",
  right: "Rechte Seite",
};

const REGION_LABELS: Record<InteractiveRegion, string> = {
  [INTERACTIVE_REGIONS.TEMPORALIS]: "Temporalis",
  [INTERACTIVE_REGIONS.MASSETER]: "Masseter",
  [INTERACTIVE_REGIONS.TMJ]: "Kiefergelenk",
  [INTERACTIVE_REGIONS.NON_MAST]: "Nicht-Kaumuskulatur",
  [INTERACTIVE_REGIONS.OTHER_MAST]: "Andere Kaumuskeln",
};

interface InlinePainBadgesProps {
  selectedRegion: RegionId;
  status: RegionStatus;
  onSetPain: () => void;
  onSetNoPain: () => void;
  onSetFamiliarPain: () => void;
  onSetNoFamiliarPain: () => void;
  onSetFamiliarHeadache: () => void;
  onSetNoFamiliarHeadache: () => void;
  className?: string;
}

export function InlinePainBadges({
  selectedRegion,
  status,
  onSetPain,
  onSetNoPain,
  onSetFamiliarPain,
  onSetNoFamiliarPain,
  onSetFamiliarHeadache,
  onSetNoFamiliarHeadache,
  className,
}: InlinePainBadgesProps) {
  const { side, region } = parseRegionId(selectedRegion);
  const isTemporalis = region === INTERACTIVE_REGIONS.TEMPORALIS;

  // Check if explicitly answered "no" (has data but not yes)
  const isFamiliarPainNo = status.hasFamiliarPainData && !status.hasFamiliarPain;
  const isFamiliarHeadacheNo = status.hasFamiliarHeadacheData && !status.hasFamiliarHeadache;

  return (
    <div className={cn("flex flex-col items-center gap-3 p-3 bg-muted/50 rounded-lg", className)}>
      {/* Region label on top */}
      <span className="text-sm font-medium">
        {REGION_LABELS[region]}, {SIDE_LABELS[side]}
      </span>

      {/* Questions in vertical layout */}
      <div className="flex flex-col gap-2">
        {/* Pain yes/no */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Schmerz:</span>
          <div className="flex items-center gap-1">
            <Badge
              variant={status.hasData && !status.isPainPositive ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none transition-colors",
                status.hasData && !status.isPainPositive
                  ? "hover:bg-primary/80"
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary"
              )}
              onClick={onSetNoPain}
            >
              Nein
            </Badge>
            <Badge
              variant={status.isPainPositive ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none transition-colors",
                status.isPainPositive
                  ? "hover:bg-primary/80"
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary"
              )}
              onClick={onSetPain}
            >
              Ja
            </Badge>
          </div>
        </div>

        {/* Familiar pain yes/no */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Bekannter Schmerz:</span>
          <div className="flex items-center gap-1">
            <Badge
              variant={isFamiliarPainNo ? "default" : "outline"}
              className={cn(
                "cursor-pointer select-none transition-colors",
                isFamiliarPainNo
                  ? "hover:bg-primary/80"
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary"
              )}
              onClick={onSetNoFamiliarPain}
            >
              Nein
            </Badge>
            <Badge
              variant={status.hasFamiliarPain ? "destructive" : "outline"}
              className={cn(
                "cursor-pointer select-none transition-colors",
                status.hasFamiliarPain
                  ? "hover:bg-destructive/80"
                  : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              )}
              onClick={onSetFamiliarPain}
            >
              Ja
            </Badge>
          </div>
        </div>

        {/* Familiar headache yes/no - only for Temporalis */}
        {isTemporalis && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Bekannter Kopfschmerz:
            </span>
            <div className="flex items-center gap-1">
              <Badge
                variant={isFamiliarHeadacheNo ? "default" : "outline"}
                className={cn(
                  "cursor-pointer select-none transition-colors",
                  isFamiliarHeadacheNo
                    ? "hover:bg-primary/80"
                    : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                )}
                onClick={onSetNoFamiliarHeadache}
              >
                Nein
              </Badge>
              <Badge
                variant={status.hasFamiliarHeadache ? "destructive" : "outline"}
                className={cn(
                  "cursor-pointer select-none transition-colors",
                  status.hasFamiliarHeadache
                    ? "hover:bg-destructive/80"
                    : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                )}
                onClick={onSetFamiliarHeadache}
              >
                Ja
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
