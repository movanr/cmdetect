import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLabel, getRegionLabel, getSideLabel } from "../../labels";
import type { QuestionInstance } from "../../projections/to-instances";
import type { MovementRegion, Side } from "../../model/regions";
import type { IncompleteRegion } from "../../form/validation";
import { QuestionField } from "../QuestionField";

export interface RegionPainQuestionsProps {
  region: MovementRegion;
  side: Side;
  questions: QuestionInstance[];
  className?: string;
  /** Regions with validation errors (incomplete data) */
  incompleteRegions?: IncompleteRegion[];
}

export function RegionPainQuestions({
  region,
  side,
  questions,
  className,
  incompleteRegions = [],
}: RegionPainQuestionsProps) {
  // Filter questions for this specific region and side
  const regionQuestions = questions.filter(
    (q) => q.context.region === region && q.context.side === side
  );

  if (regionQuestions.length === 0) return null;

  // Check if this region/side combination is incomplete
  const incomplete = incompleteRegions.find(
    (r) => r.region === region && r.side === side
  );

  const validationMessage = incomplete
    ? incomplete.missingPain
      ? "Schmerzangabe fehlt"
      : "Bitte vervollständigen"
    : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 p-3 bg-muted/50 rounded-lg",
        incomplete && "ring-1 ring-destructive",
        className
      )}
    >
      <span className="text-sm font-medium">
        {getRegionLabel(region)}, {getSideLabel(side)}
      </span>
      {validationMessage && (
        <div className="flex items-center gap-1.5 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{validationMessage}</span>
        </div>
      )}
      <div className="space-y-1">
        {regionQuestions.map((instance) => (
          <QuestionField
            key={instance.path}
            instance={instance}
            label={getLabel(instance.context.painType)}
          />
        ))}
      </div>
    </div>
  );
}
