import { useMemo } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { YesNoField } from "../inputs/YesNoField";
import {
  PALPATION_SITES,
  PALPATION_PAIN_QUESTIONS,
  SITE_CONFIG,
  getPalpationPainQuestions,
  type PalpationSite,
  type PalpationPainQuestion,
  type MuscleGroup,
} from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";

export interface TablePalpationStepProps {
  instances: QuestionInstance[];
}

// Multi-line column headers (official DC/TMD terminology)
const PAIN_TYPE_LABELS: Record<PalpationPainQuestion, string[]> = {
  pain: ["Schmerz"],
  familiarPain: ["Bekannter", "Schmerz"],
  familiarHeadache: ["Bekannter", "Kopfschmerz"],
  spreadingPain: ["Ausbreitender", "Schmerz"],
  referredPain: ["Übertragener", "Schmerz"],
};

// Group sites by muscle group for visual separators
const SITE_GROUPS: { group: MuscleGroup; sites: PalpationSite[] }[] = [
  {
    group: "temporalis",
    sites: ["temporalisPosterior", "temporalisMiddle", "temporalisAnterior"],
  },
  {
    group: "masseter",
    sites: ["masseterOrigin", "masseterBody", "masseterInsertion"],
  },
  {
    group: "tmj",
    sites: ["tmjLateralPole", "tmjAroundLateralPole"],
  },
];

/**
 * TablePalpationStep - Displays E9 palpation assessment in a compact table format
 *
 * Shows one side at a time with all 8 palpation sites in rows and 5 pain types in columns.
 * Visual separators between muscle groups (Temporalis / Masseter / Kiefergelenk).
 */
export function TablePalpationStep({ instances }: TablePalpationStepProps) {
  const { watch } = useFormContext();

  // Watch all instance paths to trigger re-renders on value changes
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Group instances by site/painType for quick lookup
  const instanceMap = useMemo(() => {
    const map = new Map<string, QuestionInstance>();
    for (const inst of instances) {
      const { site, painType } = inst.context;
      if (site && painType) {
        map.set(`${site}-${painType}`, inst);
      }
    }
    return map;
  }, [instances]);

  // Get instance for a specific site/painType
  const getInstance = (site: PalpationSite, painType: PalpationPainQuestion) =>
    instanceMap.get(`${site}-${painType}`);

  // Check if a question should be enabled (pain must be "yes" for other questions)
  const isEnabled = (site: PalpationSite, painType: PalpationPainQuestion) => {
    if (painType === "pain") return true;

    const painInstance = getInstance(site, "pain");
    if (!painInstance) return false;

    const painValue = watch(painInstance.path);
    return painValue === "yes";
  };

  // Check if a pain type applies to a site
  const appliesTo = (site: PalpationSite, painType: PalpationPainQuestion) => {
    const applicableQuestions = getPalpationPainQuestions(site);
    return applicableQuestions.includes(painType);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="p-2 text-left font-normal text-muted-foreground min-w-[180px]" />
            {PALPATION_PAIN_QUESTIONS.map((painType) => (
              <th
                key={painType}
                className="p-1 text-center text-xs font-normal text-muted-foreground whitespace-nowrap"
              >
                {PAIN_TYPE_LABELS[painType].map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SITE_GROUPS.map((group, groupIndex) => (
            group.sites.map((site, siteIndex) => {
              const isLastInGroup = siteIndex === group.sites.length - 1;
              const isLastGroup = groupIndex === SITE_GROUPS.length - 1;

              return (
                <tr
                  key={site}
                  className={cn(
                    "border-b",
                    // Add thicker border after each muscle group (except last)
                    isLastInGroup && !isLastGroup && "border-b-2 border-muted-foreground/30"
                  )}
                >
                  <td className="p-2">
                    <span className="font-medium">{PALPATION_SITES[site]}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {SITE_CONFIG[site].pressure} kg
                    </span>
                  </td>
                  {PALPATION_PAIN_QUESTIONS.map((painType) => {
                    // Check if this pain type applies to this site
                    const applies = appliesTo(site, painType);

                    if (!applies) {
                      return (
                        <td
                          key={`${site}-${painType}`}
                          className="p-1 text-center text-muted-foreground"
                        >
                          —
                        </td>
                      );
                    }

                    const instance = getInstance(site, painType);
                    if (!instance) {
                      return (
                        <td key={`${site}-${painType}`} className="p-1 text-center" />
                      );
                    }

                    const enabled = isEnabled(site, painType);

                    return (
                      <td key={`${site}-${painType}`} className="p-1 text-center">
                        <YesNoField
                          name={instance.path as FieldPath<FieldValues>}
                          disabled={!enabled}
                          className="justify-center"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ))}
        </tbody>
      </table>
    </div>
  );
}
