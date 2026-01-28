import { getLabel, getPalpationSiteLabel } from "../../labels";
import type { PalpationSite } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { QuestionField } from "../QuestionField";

export interface SiteQuestionsProps {
  questions: QuestionInstance[];
}

export function SiteQuestions({ questions }: SiteQuestionsProps) {
  // Group by site
  const bySite = questions.reduce<Record<string, QuestionInstance[]>>((acc, q) => {
    const site = q.context.site ?? "unknown";
    if (!acc[site]) acc[site] = [];
    acc[site].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-4 pl-2">
      {Object.entries(bySite).map(([site, siteQuestions]) => (
        <div key={site} className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground">
            {getPalpationSiteLabel(site as PalpationSite)}
          </h5>
          <div className="pl-2 space-y-1">
            {siteQuestions.map((instance) => (
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
