/**
 * DiagnosisReference — Static reference list of all 12 DC/TMD diagnoses
 * grouped by category (pain / joint disorders).
 *
 * Each diagnosis expands to show its criteria checklist in read-only mode.
 * Accordion behaviour: only one diagnosis expanded at a time.
 * Completely independent of the diagnosis selector — pure reference UI.
 */

import { ALL_DIAGNOSES, type DiagnosisDefinition, type DiagnosisId, type Region, type Side } from "@cmdetect/dc-tmd";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { InlineCriteriaChecklist } from "./InlineCriteriaChecklist";

interface DiagnosisReferenceProps {
  criteriaData: Record<string, unknown>;
  selectedDiagnosisId?: DiagnosisId | null;
  onDiagnosisChange?: (id: DiagnosisId | null) => void;
}

const CATEGORIES = [
  { key: "pain", label: "Schmerzerkrankungen" },
  { key: "joint", label: "Gelenkerkrankungen" },
] as const;

const EMPTY_MAP = new Map();
const noop = () => {};

export function DiagnosisReference({
  criteriaData,
  selectedDiagnosisId,
  onDiagnosisChange,
}: DiagnosisReferenceProps) {
  const [localExpandedId, setLocalExpandedId] = useState<string | null>(null);
  const expandedId = selectedDiagnosisId ?? localExpandedId;

  const grouped = useMemo(() => {
    const pain = ALL_DIAGNOSES.filter((d) => d.category === "pain");
    const joint = ALL_DIAGNOSES.filter((d) => d.category === "joint");
    return { pain, joint };
  }, []);

  function toggle(id: string) {
    const next = expandedId === id ? null : id;
    setLocalExpandedId(next);
    onDiagnosisChange?.(next as DiagnosisId | null);
  }

  return (
    <div className="space-y-6">
      {CATEGORIES.map(({ key, label }) => (
        <div key={key}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2">
            {label}
          </div>
          <div className="rounded-md border divide-y">
            {grouped[key].map((diagnosis) => (
              <DiagnosisRow
                key={diagnosis.id}
                diagnosis={diagnosis}
                expanded={expandedId === diagnosis.id}
                onToggle={() => toggle(diagnosis.id)}
                criteriaData={criteriaData}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DiagnosisRow({
  diagnosis,
  expanded,
  onToggle,
  criteriaData,
}: {
  diagnosis: DiagnosisDefinition;
  expanded: boolean;
  onToggle: () => void;
  criteriaData: Record<string, unknown>;
}) {
  const defaultSide: Side = "right";
  const defaultRegion: Region = diagnosis.examination.regions[0];

  return (
    <div
      className={cn(
        "transition-colors",
        expanded && "border-l-2 border-l-primary bg-muted/10",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2.5 text-left transition-colors",
          expanded ? "bg-muted/30" : "hover:bg-muted/50",
        )}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            expanded ? "rotate-90 text-primary" : "text-muted-foreground",
          )}
        />
        <span className="text-sm font-medium">{diagnosis.nameDE}</span>
      </button>
      {expanded && (
        <div className="pl-[calc(1rem+0.5rem)]">
          <InlineCriteriaChecklist
            diagnosis={diagnosis}
            criteriaData={criteriaData}
            side={defaultSide}
            region={defaultRegion}
            assessmentMap={EMPTY_MAP}
            onAssessmentChange={noop}
            onAssessmentClear={noop}
            readOnly
          />
        </div>
      )}
    </div>
  );
}
