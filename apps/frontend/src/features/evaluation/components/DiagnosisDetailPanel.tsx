/**
 * DiagnosisDetailPanel — Shows clinical context for a selected positive diagnosis.
 *
 * Displays ICD-10 code, description, diagnostic validity (sensitivity/specificity),
 * confidence level, comments, and imaging recommendations when applicable.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getDiagnosisClinicalContext,
  getDiagnosisById,
  type DiagnosisId,
  type DiagnosticValidity,
} from "@cmdetect/dc-tmd";
import { ImageIcon, Info } from "lucide-react";

interface DiagnosisDetailPanelProps {
  diagnosisId: DiagnosisId;
}

const LEVEL_CONFIG: Record<
  DiagnosticValidity["level"],
  { label: string; className: string } | null
> = {
  definitive: null,
  provisional: null,
  contentValidityOnly: {
    label: "Inhaltsvalidität \u2014 Kriterienvalidität nicht bestimmt",
    className: "text-gray-600 bg-gray-50 border-gray-200",
  },
};

export function DiagnosisDetailPanel({ diagnosisId }: DiagnosisDetailPanelProps) {
  const context = getDiagnosisClinicalContext(diagnosisId);
  const definition = getDiagnosisById(diagnosisId);
  if (!context || !definition) return null;

  const levelConfig = LEVEL_CONFIG[context.validity.level];

  return (
    <div className="mt-4 rounded-lg border bg-muted/30 p-4 space-y-3">
      {/* Header: name + ICD-10 */}
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-sm font-semibold">{definition.nameDE}</h4>
        <Badge variant="outline" className="shrink-0 font-mono text-xs">
          ICD-10: {context.icd10}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {context.descriptionDE}
      </p>

      {/* Validity */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{context.validityDE}</span>
        {levelConfig && (
          <Badge
            variant="outline"
            className={cn("text-xs", levelConfig.className)}
          >
            {levelConfig.label}
          </Badge>
        )}
      </div>

      {/* Imaging recommendation */}
      {context.imagingDE && (
        <div className="flex gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2.5">
          <ImageIcon className="size-4 shrink-0 mt-0.5" />
          <span>{context.imagingDE}</span>
        </div>
      )}

      {/* Comments */}
      {context.commentsDE.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Info className="size-3.5" />
            Hinweise
          </div>
          <ul className="text-sm text-muted-foreground space-y-0.5 ml-5 list-disc">
            {context.commentsDE.map((comment, i) => (
              <li key={i}>{comment}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
