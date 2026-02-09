/**
 * RegionDiagnosisList — All diagnoses applicable to the selected region.
 *
 * Shows a list of clickable rows with a status dot, diagnosis name,
 * and StatusBadge for each diagnosis in the currently selected (side, region).
 */

import type { CriterionStatus, DiagnosisId } from "@cmdetect/dc-tmd";
import { cn } from "@/lib/utils";
import { StatusBadge, STATUS_CONFIG } from "./StatusBadge";

export interface RegionDiagnosis {
  diagnosisId: DiagnosisId;
  nameDE: string;
  effectiveStatus: CriterionStatus;
}

interface RegionDiagnosisListProps {
  diagnoses: RegionDiagnosis[];
  selectedDiagnosis: DiagnosisId | null;
  onDiagnosisSelect: (id: DiagnosisId) => void;
}

export function RegionDiagnosisList({
  diagnoses,
  selectedDiagnosis,
  onDiagnosisSelect,
}: RegionDiagnosisListProps) {
  if (diagnoses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Diagnosen für diese Region
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {diagnoses.map((d) => {
        const isSelected = selectedDiagnosis === d.diagnosisId;
        const config = STATUS_CONFIG[d.effectiveStatus];
        return (
          <button
            key={d.diagnosisId}
            type="button"
            onClick={() => onDiagnosisSelect(d.diagnosisId)}
            className={cn(
              "flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-md transition-colors",
              isSelected
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block w-2.5 h-2.5 rounded-full shrink-0",
                config.dotClass
              )}
            />
            <span className="flex-1 truncate">{d.nameDE}</span>
            <StatusBadge status={d.effectiveStatus} />
          </button>
        );
      })}
    </div>
  );
}
