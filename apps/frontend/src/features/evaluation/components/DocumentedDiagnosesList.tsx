/**
 * DocumentedDiagnosesList — Displays confirmed diagnoses grouped by location.
 *
 * Shows each documented diagnosis with its side/region label and a remove button.
 * This list mirrors what appears in the printed report.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ALL_DIAGNOSES,
  getDiagnosisClinicalContext,
  PALPATION_SITES,
  REGIONS,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { X } from "lucide-react";
import { useMemo } from "react";
import type { DocumentedDiagnosis } from "../types";

interface DocumentedDiagnosesListProps {
  diagnoses: DocumentedDiagnosis[];
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

const SIDE_LABELS: Record<Side, string> = { right: "rechts", left: "links" };

function locationLabel(region: Region, side: Side, site: PalpationSite | null): string {
  const name = site ? PALPATION_SITES[site] : region === "tmj" ? "Kiefergelenk" : REGIONS[region];
  return `${name} ${SIDE_LABELS[side]}`;
}

function diagnosisName(diagnosisId: string): string {
  return ALL_DIAGNOSES.find((d) => d.id === diagnosisId)?.nameDE ?? diagnosisId;
}

interface LocationGroup {
  key: string;
  label: string;
  items: DocumentedDiagnosis[];
}

function groupByLocation(diagnoses: DocumentedDiagnosis[]): LocationGroup[] {
  const map = new Map<string, LocationGroup>();
  for (const d of diagnoses) {
    const key = `${d.region}-${d.side}-${d.site ?? ""}`;
    if (!map.has(key)) {
      map.set(key, { key, label: locationLabel(d.region, d.side, d.site), items: [] });
    }
    map.get(key)!.items.push(d);
  }
  return Array.from(map.values());
}

export function DocumentedDiagnosesList({
  diagnoses,
  onRemove,
  readOnly,
}: DocumentedDiagnosesListProps) {
  const groups = useMemo(() => groupByLocation(diagnoses), [diagnoses]);

  if (diagnoses.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Keine Diagnosen dokumentiert.</p>;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1">
            {group.label}
          </div>
          <ul className="space-y-1">
            {group.items.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span>{diagnosisName(d.diagnosisId)}</span>
                  <Badge variant="outline" className="text-[10px] font-mono px-1 py-0 text-muted-foreground shrink-0">
                    {getDiagnosisClinicalContext(d.diagnosisId).icd10}
                  </Badge>
                </span>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemove(d.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
