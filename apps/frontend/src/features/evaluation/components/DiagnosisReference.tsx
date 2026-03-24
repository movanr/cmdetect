/**
 * DiagnosisReference — Static reference list of all 12 DC/TMD diagnoses
 * grouped by category (pain / joint disorders).
 *
 * Each diagnosis expands to show its criteria checklist in read-only mode.
 * Accordion behaviour: only one diagnosis expanded at a time.
 */

import { ALL_DIAGNOSES, type DiagnosisDefinition } from "@cmdetect/dc-tmd";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { InlineCriteriaChecklist } from "./InlineCriteriaChecklist";

interface DiagnosisReferenceProps {
  criteriaData: Record<string, unknown>;
}

const CATEGORIES = [
  { key: "pain", label: "Schmerzerkrankungen" },
  { key: "joint", label: "Gelenkerkrankungen" },
] as const;

const EMPTY_MAP = new Map();
const noop = () => {};

export function DiagnosisReference({ criteriaData }: DiagnosisReferenceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
  const defaultRegion = diagnosis.examination.regions[0];

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
            side="right"
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
