/**
 * PositiveDiagnosesList — Shows positive diagnoses grouped by (region, side).
 *
 * Each group has a heading like "Temporalis, Rechte Seite" followed by
 * a bulleted list of clickable diagnosis names.
 */

import { REGIONS, SIDES, type DiagnosisId, type Region, type Side } from "@cmdetect/dc-tmd";
import { cn } from "@/lib/utils";

export interface PositiveGroup {
  region: Region;
  side: Side;
  diagnoses: Array<{ diagnosisId: DiagnosisId; nameDE: string }>;
}

interface PositiveDiagnosesListProps {
  groups: PositiveGroup[];
  selectedSide: Side;
  selectedRegion: Region;
  selectedDiagnosis: DiagnosisId | null;
  onDiagnosisClick: (side: Side, region: Region, diagnosisId: DiagnosisId) => void;
}

export function PositiveDiagnosesList({
  groups,
  selectedSide,
  selectedRegion,
  selectedDiagnosis,
  onDiagnosisClick,
}: PositiveDiagnosesListProps) {
  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Keine positiven Diagnosen</p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const heading = `${REGIONS[group.region]}, ${SIDES[group.side]}`;
        return (
          <div key={`${group.side}-${group.region}`}>
            <h3 className="text-sm font-semibold mb-1">{heading}</h3>
            <ul className="space-y-0.5 ml-1">
              {group.diagnoses.map((d) => {
                const isSelected =
                  selectedDiagnosis === d.diagnosisId &&
                  selectedSide === group.side &&
                  selectedRegion === group.region;
                return (
                  <li key={d.diagnosisId}>
                    <button
                      type="button"
                      onClick={() =>
                        onDiagnosisClick(group.side, group.region, d.diagnosisId)
                      }
                      className={cn(
                        "flex items-center gap-2 text-sm px-2 py-0.5 rounded w-full text-left transition-colors",
                        isSelected
                          ? "bg-blue-50 text-blue-800 font-medium"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {d.nameDE}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
