/**
 * EndNodePopover — Popover shown when clicking a blue end node in a decision tree.
 *
 * Displays the diagnosis name, localisation (region + side), and a confirm/remove button
 * so the practitioner actively selects diagnoses at the point of decision.
 */

import { Button } from "@/components/ui/button";
import {
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import { getDiagnosisById, REGIONS, SIDES, type Region, type Side } from "@cmdetect/dc-tmd";
import { CircleCheck, CircleMinus } from "lucide-react";
import type { PractitionerDecision } from "../../evaluation/types";

interface EndNodePopoverProps {
  diagnosisId: string;
  side: Side;
  region: Region;
  decision: PractitionerDecision;
  onConfirm: (diagnosisId: string, note: string | null) => void;
  readOnly?: boolean;
}

export function EndNodePopover({
  diagnosisId,
  side,
  region,
  decision,
  onConfirm,
  readOnly,
}: EndNodePopoverProps) {
  const definition = getDiagnosisById(diagnosisId);
  const nameDE = definition?.nameDE ?? diagnosisId;
  const regionLabel = REGIONS[region] ?? region;
  const sideLabel = SIDES[side] ?? side;
  const isConfirmed = decision === "confirmed" || decision === "added";

  return (
    <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
      <PopoverHeader>
        <PopoverTitle>{nameDE}</PopoverTitle>
        <PopoverDescription>
          {regionLabel}, {sideLabel}
        </PopoverDescription>
      </PopoverHeader>

      {!readOnly && (
        <div className="mt-3 space-y-3">
          <Button
            size="sm"
            className="w-full"
            variant={isConfirmed ? "outline" : "default"}
            onClick={() => onConfirm(diagnosisId, null)}
          >
            {isConfirmed ? (
              <>
                <CircleMinus className="mr-2 h-4 w-4" />
                Diagnose aufheben
              </>
            ) : (
              <>
                <CircleCheck className="mr-2 h-4 w-4" />
                Diagnose stellen
              </>
            )}
          </Button>
        </div>
      )}
    </PopoverContent>
  );
}
