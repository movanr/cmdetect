/**
 * DiagnosisClinicalContextBlock — Renders clinical metadata for a DC/TMD diagnosis.
 *
 * Shows ICD-10 code, diagnostic validity (sensitivity/specificity),
 * clinical description, imaging recommendation, and comments.
 * Data sourced from Schiffman et al. (2014).
 */

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getDiagnosisClinicalContext, type DiagnosisId } from "@cmdetect/dc-tmd";
import { MessageSquareText, ScanLine } from "lucide-react";
import { useMemo } from "react";

const VALIDITY_LEVEL_CONFIG = {
  definitive: {
    label: "Klinisch validiert",
    tooltip:
      "Die klinischen Diagnosekriterien haben eine ausreichende Sensitivität und Spezifität. Eine Diagnosestellung ist ohne Bildgebung möglich.",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  provisional: {
    label: "Bildgebung empfohlen",
    tooltip:
      "Die klinischen Kriterien allein haben eine unzureichende Validität. Bildgebung ist der Referenzstandard zur Bestätigung dieser Diagnose.",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  contentValidityOnly: {
    label: "Klinische Differenzierung",
    tooltip:
      "Subtyp-Differenzierung innerhalb einer validierten Diagnose. Sensitivität und Spezifität wurden nicht eigenständig untersucht.",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
} as const;

interface DiagnosisClinicalContextBlockProps {
  diagnosisId: DiagnosisId;
}

export function DiagnosisClinicalContextBlock({
  diagnosisId,
}: DiagnosisClinicalContextBlockProps) {
  const ctx = useMemo(() => getDiagnosisClinicalContext(diagnosisId), [diagnosisId]);
  const levelConfig = VALIDITY_LEVEL_CONFIG[ctx.validity.level];

  return (
    <div className="space-y-2 px-3 py-3 mb-1 rounded-md bg-muted/20 border">
      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="font-mono text-xs">
          ICD-10: {ctx.icd10}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn("text-xs cursor-help", levelConfig.className)}>
              {levelConfig.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-xs">
            {levelConfig.tooltip}
          </TooltipContent>
        </Tooltip>
        <span className="text-xs text-muted-foreground">{ctx.validityDE}</span>
      </div>

      {/* Clinical description */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {ctx.descriptionDE}
      </p>

      {/* Imaging recommendation */}
      {ctx.imagingDE && (
        <div className="flex items-start gap-1.5 text-xs bg-blue-50/50 border border-blue-100 rounded-md px-2 py-1.5">
          <ScanLine className="h-3.5 w-3.5 shrink-0 text-blue-600 mt-0.5" />
          <span className="text-blue-800">{ctx.imagingDE}</span>
        </div>
      )}

      {/* Clinical comments */}
      {ctx.commentsDE.length > 0 && (
        <div className="space-y-1">
          {ctx.commentsDE.map((comment, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <MessageSquareText className="h-3 w-3 shrink-0 mt-0.5" aria-hidden />
              <span>{comment}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
