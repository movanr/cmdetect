import { getLabel, getRegionLabel } from "../../labels";
import type { QuestionInstance } from "../../projections/to-instances";
import { QuestionField } from "../QuestionField";

export interface InterviewColumnProps {
  title: string;
  questions: QuestionInstance[];
}

export function InterviewColumn({ title, questions }: InterviewColumnProps) {
  // Group by region
  const byRegion = questions.reduce<Record<string, QuestionInstance[]>>((acc, q) => {
    const region = q.context.region ?? "unknown";
    if (!acc[region]) acc[region] = [];
    acc[region].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm border-b pb-2">{title}</h4>
      {Object.entries(byRegion).map(([region, regionQuestions]) => (
        <div key={region} className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">{getRegionLabel(region)}</h5>
          <div className="pl-2 space-y-1">
            {regionQuestions.map((instance) => (
              <QuestionField
                key={instance.path}
                instance={instance}
                label={getLabel(instance.context.painType)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
