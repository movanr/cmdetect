/**
 * Per-diagnosis anamnesis relevance display.
 *
 * Shows each diagnosis's anamnesis status (positive/pending/negative)
 * and required examination sections, grouped by category.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getPerDiagnosisAnamnesisResults,
  getSectionBadge,
  type DiagnosisAnamnesisResult,
} from "@cmdetect/dc-tmd";
import { useMemo } from "react";

interface AnamnesisRelevanceCardProps {
  sqAnswers: Record<string, unknown>;
}

function getDotColor(status: DiagnosisAnamnesisResult["anamnesisStatus"]): string {
  return status === "positive" ? "bg-blue-500" : "bg-gray-300";
}

export function AnamnesisRelevanceCard({ sqAnswers }: AnamnesisRelevanceCardProps) {
  const results = useMemo(() => getPerDiagnosisAnamnesisResults(sqAnswers), [sqAnswers]);

  const painDiagnoses = results.filter((r) => r.category === "pain");
  const jointDiagnoses = results.filter((r) => r.category === "joint");

  return (
    <div className="space-y-3 text-sm">
      <DiagnosisGroup label="Schmerzdiagnosen" diagnoses={painDiagnoses} />
      <DiagnosisGroup label="Gelenkdiagnosen" diagnoses={jointDiagnoses} />
    </div>
  );
}

function DiagnosisGroup({
  label,
  diagnoses,
}: {
  label: string;
  diagnoses: DiagnosisAnamnesisResult[];
}) {
  if (diagnoses.length === 0) return null;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </p>
      <div className="space-y-0.5">
        {diagnoses.map((d) => (
          <DiagnosisRow key={d.id} diagnosis={d} />
        ))}
      </div>
    </div>
  );
}

function DiagnosisRow({ diagnosis }: { diagnosis: DiagnosisAnamnesisResult }) {
  const isPositive = diagnosis.anamnesisStatus === "positive";

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-0.5",
        !isPositive && "opacity-50"
      )}
    >
      {/* Status dot */}
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full shrink-0",
          getDotColor(diagnosis.anamnesisStatus)
        )}
      />

      {/* Diagnosis name */}
      <span className={cn("flex-1 min-w-0 truncate", !isPositive && "text-muted-foreground")}>
        {diagnosis.nameDE}
      </span>

      {/* Exam section badges */}
      <div className="flex gap-1 shrink-0">
        {isPositive && diagnosis.examinationSections.length > 0 ? (
          diagnosis.examinationSections.map((sectionId) => (
            <Badge
              key={sectionId}
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {getSectionBadge(sectionId)}
            </Badge>
          ))
        ) : isPositive ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : null}
      </div>
    </div>
  );
}
