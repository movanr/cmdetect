import { getRegionLabel } from "../../labels";
import { PALPATION_REGIONS } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { SiteQuestions } from "./SiteQuestions";

export interface PalpationStepProps {
  instances: QuestionInstance[];
}

export function PalpationStep({ instances }: PalpationStepProps) {
  // Group by region context
  const byRegion = instances.reduce<Record<string, QuestionInstance[]>>((acc, q) => {
    const group = q.context.region ?? "unknown";
    if (!acc[group]) acc[group] = [];
    acc[group].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {PALPATION_REGIONS.map((group) => {
        const groupQuestions = byRegion[group];
        if (!groupQuestions?.length) return null;

        return (
          <div key={group} className="space-y-4">
            <h4 className="font-medium text-base border-b pb-1">{getRegionLabel(group)}</h4>
            <SiteQuestions questions={groupQuestions} />
          </div>
        );
      })}
    </div>
  );
}
