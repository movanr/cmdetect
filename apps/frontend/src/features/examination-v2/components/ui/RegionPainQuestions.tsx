import { cn } from "@/lib/utils";
import { getLabel, getRegionLabel, getSideLabel } from "../../labels";
import type { QuestionInstance } from "../../projections/to-instances";
import type { MovementRegion, Side } from "../../model/regions";
import { QuestionField } from "../QuestionField";

export interface RegionPainQuestionsProps {
  region: MovementRegion;
  side: Side;
  questions: QuestionInstance[];
  className?: string;
}

export function RegionPainQuestions({
  region,
  side,
  questions,
  className,
}: RegionPainQuestionsProps) {
  // Filter questions for this specific region and side
  const regionQuestions = questions.filter(
    (q) => q.context.region === region && q.context.side === side
  );

  if (regionQuestions.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 p-3 bg-muted/50 rounded-lg",
        className
      )}
    >
      <span className="text-sm font-medium">
        {getRegionLabel(region)}, {getSideLabel(side)}
      </span>
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
