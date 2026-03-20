/**
 * DiagnosisListItem — Expandable row for a single diagnosis in the
 * unified diagnosis list.
 *
 * Collapsed: checkbox + diagnosis name + localisation label + expand chevron.
 * Expanded: InlineCriteriaChecklist rendered below the header.
 */

import { Checkbox } from "@/components/ui/checkbox";
import type {
  DiagnosisDefinition,
  PalpationSite,
  Region,
  Side,
} from "@cmdetect/dc-tmd";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import type { CriteriaAssessment, CriterionUserState } from "../types";
import type { ChecklistItem } from "../utils/extract-criteria-items";
import { InlineCriteriaChecklist } from "./InlineCriteriaChecklist";

interface DiagnosisListItemProps {
  diagnosis: DiagnosisDefinition;
  side: Side;
  region: Region;
  site: PalpationSite | null;
  localisationLabel: string;
  isDocumented: boolean;
  criteriaData: Record<string, unknown>;
  assessmentMap: Map<string, CriteriaAssessment>;
  onToggleDocument: () => void;
  onAssessmentChange: (item: ChecklistItem, state: CriterionUserState) => void;
  onAssessmentClear: (item: ChecklistItem) => void;
  readOnly?: boolean;
  requirementMet?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function DiagnosisListItem({
  diagnosis,
  side,
  region,
  site,
  localisationLabel,
  isDocumented,
  criteriaData,
  assessmentMap,
  onToggleDocument,
  onAssessmentChange,
  onAssessmentClear,
  readOnly,
  requirementMet,
  isExpanded,
  onToggleExpand,
}: DiagnosisListItemProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 py-2.5 px-3 hover:bg-muted/50 cursor-pointer"
        onClick={onToggleExpand}
      >
        <Checkbox
          checked={isDocumented}
          disabled={readOnly}
          onCheckedChange={() => onToggleDocument()}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        />
        <span className="text-sm font-medium flex-1">
          {diagnosis.nameDE}{" "}
          <span className="font-normal text-muted-foreground">({localisationLabel})</span>
        </span>
        {requirementMet === false && (
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>

      {/* Requirement warning — only when collapsed */}
      {requirementMet === false && !isExpanded && (
        <p className="text-xs text-amber-700 px-3 pb-2 ml-9">
          Voraussetzung: Myalgie oder Arthralgie muss ebenfalls positiv sein.
        </p>
      )}

      {/* Expanded criteria checklist */}
      {isExpanded && (
        <div className="border-t">
          <InlineCriteriaChecklist
            diagnosis={diagnosis}
            criteriaData={criteriaData}
            side={side}
            region={region}
            site={site ?? undefined}
            assessmentMap={assessmentMap}
            onAssessmentChange={onAssessmentChange}
            onAssessmentClear={onAssessmentClear}
            readOnly={readOnly}
            requirementMet={requirementMet}
          />
        </div>
      )}
    </div>
  );
}
