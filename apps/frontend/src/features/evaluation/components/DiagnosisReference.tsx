/**
 * DiagnosisReference — Static reference list of all 12 DC/TMD diagnoses
 * grouped by category (pain / joint disorders).
 *
 * Each diagnosis expands to show its criteria checklist in read-only mode.
 * Accordion behaviour: only one diagnosis expanded at a time.
 *
 * When a diagnosis is selected via the selector, it auto-expands with
 * the chosen side/region context for accurate criteria evaluation.
 */

import {
  ALL_DIAGNOSES,
  type DiagnosisDefinition,
  type DiagnosisId,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { InlineCriteriaChecklist } from "./InlineCriteriaChecklist";

interface DiagnosisReferenceProps {
  criteriaData: Record<string, unknown>;
  selectedDiagnosisId?: DiagnosisId | null;
  selectedSide?: Side | null;
  selectedRegion?: Region | null;
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
  selectedSide,
  selectedRegion,
}: DiagnosisReferenceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auto-expand when selector completes a selection
  useEffect(() => {
    if (selectedDiagnosisId) {
      setExpandedId(selectedDiagnosisId);
    }
  }, [selectedDiagnosisId, selectedSide, selectedRegion]);

  const grouped = useMemo(() => {
    const pain = ALL_DIAGNOSES.filter((d) => d.category === "pain");
    const joint = ALL_DIAGNOSES.filter((d) => d.category === "joint");
    return { pain, joint };
  }, []);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      {CATEGORIES.map(({ key, label }) => (
        <div key={key}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2">
            {label}
          </div>
          <div className="rounded-md border divide-y">
            {grouped[key].map((diagnosis) => {
              const isExpanded = expandedId === diagnosis.id;
              // Use selector values when this diagnosis is the selected one, otherwise defaults
              const isSelected = selectedDiagnosisId === diagnosis.id;
              const side = isSelected && selectedSide ? selectedSide : "right";
              const region =
                isSelected && selectedRegion ? selectedRegion : diagnosis.examination.regions[0];

              return (
                <DiagnosisRow
                  key={diagnosis.id}
                  diagnosis={diagnosis}
                  expanded={isExpanded}
                  onToggle={() => toggle(diagnosis.id)}
                  criteriaData={criteriaData}
                  side={side}
                  region={region}
                />
              );
            })}
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
  side,
  region,
}: {
  diagnosis: DiagnosisDefinition;
  expanded: boolean;
  onToggle: () => void;
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-90",
          )}
        />
        <span className="text-sm font-medium">{diagnosis.nameDE}</span>
      </button>
      {expanded && (
        <div className="border-t bg-muted/20">
          <InlineCriteriaChecklist
            diagnosis={diagnosis}
            criteriaData={criteriaData}
            side={side}
            region={region}
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
