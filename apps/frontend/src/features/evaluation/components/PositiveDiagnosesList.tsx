/**
 * PositiveDiagnosesList — Shows positive diagnoses grouped by (region, side)
 * with inline confirm/reject/note controls.
 *
 * Each group has a heading like "Temporalis, Rechte Seite" followed by
 * DiagnosisListItem rows with practitioner decision buttons.
 */

import {
  REGIONS,
  SIDES,
  type CriterionStatus,
  type DiagnosisId,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import type { PractitionerDecision } from "../types";
import { DiagnosisListItem } from "./DiagnosisListItem";

// Stable no-op — only reachable when readOnly hides all action buttons
const NOOP_UPDATE_DECISION = () => {};

export interface PositiveGroupDiagnosis {
  diagnosisId: DiagnosisId;
  nameDE: string;
  resultId: string;
  computedStatus: CriterionStatus;
  practitionerDecision: PractitionerDecision;
  note: string | null;
}

export interface PositiveGroup {
  region: Region;
  side: Side;
  diagnoses: PositiveGroupDiagnosis[];
}

interface PositiveDiagnosesListProps {
  groups: PositiveGroup[];
  selectedSide: Side;
  selectedRegion: Region;
  /** Currently selected tree type (used for highlighting). */
  selectedTree: string | null;
  /** Maps a DiagnosisId to its tree type for highlight comparison. */
  diagnosisToTree: (id: DiagnosisId) => string;
  onDiagnosisClick: (side: Side, region: Region, diagnosisId: DiagnosisId) => void;
  onUpdateDecision?: (params: {
    resultId: string;
    practitionerDecision: PractitionerDecision;
    note: string | null;
  }) => void;
  readOnly?: boolean;
}

export function PositiveDiagnosesList({
  groups,
  selectedSide,
  selectedRegion,
  selectedTree,
  diagnosisToTree,
  onDiagnosisClick,
  onUpdateDecision,
  readOnly,
}: PositiveDiagnosesListProps) {
  if (groups.length === 0) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Keine Diagnosen gestellt</p>
        <p className="text-xs text-muted-foreground">
          Wenn Sie eine DC/TMD-Diagnose stellen wollen, wählen Sie diese aus einem Endknoten des
          jeweiligen Entscheidungsbaums aus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const heading = `${REGIONS[group.region]}, ${SIDES[group.side]}`;
        return (
          <div key={`${group.side}-${group.region}`}>
            <h3 className="text-sm font-semibold mb-1">{heading}</h3>
            <div className="space-y-0.5 ml-1">
              {group.diagnoses.map((d) => {
                const isSelected =
                  selectedTree === diagnosisToTree(d.diagnosisId) &&
                  selectedSide === group.side &&
                  selectedRegion === group.region;
                return (
                  <DiagnosisListItem
                    key={d.diagnosisId}
                    diagnosisId={d.diagnosisId}
                    nameDE={d.nameDE}
                    computedStatus={d.computedStatus}
                    practitionerDecision={d.practitionerDecision}
                    note={d.note}
                    resultId={d.resultId}
                    isSelected={isSelected}
                    onDiagnosisClick={() =>
                      onDiagnosisClick(group.side, group.region, d.diagnosisId)
                    }
                    onUpdateDecision={onUpdateDecision ?? NOOP_UPDATE_DECISION}
                    readOnly={readOnly || !onUpdateDecision}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
