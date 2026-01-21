import { getMuscleGroupLabel } from "../../labels";
import { MUSCLE_GROUP_KEYS } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { SiteQuestions } from "./SiteQuestions";

export interface PalpationStepProps {
  instances: QuestionInstance[];
}

export function PalpationStep({ instances }: PalpationStepProps) {
  // Group by muscleGroup context
  const byMuscleGroup = instances.reduce<Record<string, QuestionInstance[]>>((acc, q) => {
    const group = q.context.muscleGroup ?? "unknown";
    if (!acc[group]) acc[group] = [];
    acc[group].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {MUSCLE_GROUP_KEYS.map((group) => {
        const groupQuestions = byMuscleGroup[group];
        if (!groupQuestions?.length) return null;

        return (
          <div key={group} className="space-y-4">
            <h4 className="font-medium text-base border-b pb-1">{getMuscleGroupLabel(group)}</h4>
            <SiteQuestions questions={groupQuestions} />
          </div>
        );
      })}
    </div>
  );
}
