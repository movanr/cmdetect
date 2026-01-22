import { useMemo, useCallback } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { YesNoField } from "../inputs/YesNoField";
import { YesNoInput } from "../inputs/YesNoInput";
import {
  PALPATION_SITES,
  SITE_CONFIG,
  getPalpationPainQuestions,
  PALPATION_MODE_QUESTIONS,
  MUSCLE_GROUPS,
  MUSCLE_GROUP_KEYS,
  SITES_BY_GROUP,
  GROUP_CONFIG,
  type PalpationSite,
  type PalpationPainQuestion,
  type PalpationMode,
  type MuscleGroup,
  type SiteDetailMode,
} from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";

export interface TablePalpationStepProps {
  instances: QuestionInstance[];
  palpationMode: PalpationMode;
  siteDetailMode: SiteDetailMode;
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
 * Aggregates yes/no values from multiple sites using OR logic.
 * - "yes" OR anything = "yes" (if any site is positive, group is positive)
 * - "no" OR "no" = "no" (all answered sites are negative)
 * - "no" OR null = null (incomplete data - can't determine)
 * - null OR null = null (no data)
 */
function aggregateYesNo(values: (string | null | undefined)[]): "yes" | "no" | null {
  // If any site is "yes", group is "yes"
  if (values.some((v) => v === "yes")) return "yes";
  // If any site is null/unanswered, we can't determine (incomplete)
  if (values.some((v) => v === null || v === undefined)) return null;
  // All sites are "no"
  if (values.every((v) => v === "no")) return "no";
  return null;
}

/**
 * TablePalpationStep - Displays E9 palpation assessment in a compact table format
 *
 * Shows one side at a time with pain types in columns.
 * - Detailed mode: 8 individual palpation sites in rows
 * - Grouped mode: 3 muscle groups in rows with aggregated values
 *
 * Visual separators between muscle groups (Temporalis / Masseter / Kiefergelenk).
 */
export function TablePalpationStep({
  instances,
  palpationMode,
  siteDetailMode,
}: TablePalpationStepProps) {
  const { watch, setValue } = useFormContext();

  // Get visible pain questions based on palpation mode
  const visibleQuestions = PALPATION_MODE_QUESTIONS[palpationMode];

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

  // Check if a question should be enabled for individual site (pain must be "yes" for other questions)
  const isEnabled = (site: PalpationSite, painType: PalpationPainQuestion) => {
    if (painType === "pain") return true;

    const painInstance = getInstance(site, "pain");
    if (!painInstance) return false;

    const painValue = watch(painInstance.path);
    return painValue === "yes";
  };

  // Check if a question should be enabled for a group (at least one site's pain must be "yes")
  const isGroupEnabled = (group: MuscleGroup, painType: PalpationPainQuestion) => {
    if (painType === "pain") return true;

    // Check if any site in the group has pain === "yes"
    const sites = SITES_BY_GROUP[group];
    return sites.some((site) => {
      const painInstance = getInstance(site, "pain");
      if (!painInstance) return false;
      const painValue = watch(painInstance.path);
      return painValue === "yes";
    });
  };

  // Check if a pain type applies to a site
  const appliesTo = (site: PalpationSite, painType: PalpationPainQuestion) => {
    const applicableQuestions = getPalpationPainQuestions(site);
    return applicableQuestions.includes(painType);
  };

  // Check if a pain type applies to a group
  const appliesToGroup = (group: MuscleGroup, painType: PalpationPainQuestion) => {
    const config = GROUP_CONFIG[group];
    if (painType === "pain" || painType === "familiarPain" || painType === "referredPain") {
      return true;
    }
    if (painType === "familiarHeadache") return config.hasHeadache;
    if (painType === "spreadingPain") return config.hasSpreading;
    return false;
  };

  // Get aggregated value for a muscle group and pain type
  const getGroupValue = useCallback(
    (group: MuscleGroup, painType: PalpationPainQuestion): "yes" | "no" | null => {
      const sites = SITES_BY_GROUP[group];
      const values = sites
        .filter((site) => appliesTo(site, painType))
        .map((site) => {
          const instance = getInstance(site, painType);
          if (!instance) return null;
          return watch(instance.path) as string | null;
        });

      return aggregateYesNo(values);
    },
    [getInstance, watch]
  );

  // Set value for all sites in a group
  const setGroupValue = useCallback(
    (group: MuscleGroup, painType: PalpationPainQuestion, value: "yes" | "no" | null) => {
      const sites = SITES_BY_GROUP[group];
      for (const site of sites) {
        // Only set for sites where this pain type applies
        if (appliesTo(site, painType)) {
          const instance = getInstance(site, painType);
          if (instance) {
            setValue(instance.path, value);
          }
        }
      }
    },
    [getInstance, setValue]
  );

  // Render table header
  const renderHeader = () => (
    <thead>
      <tr className="border-b bg-muted/30">
        <th className="p-2 text-left font-normal text-muted-foreground min-w-[180px]" />
        {visibleQuestions.map((painType) => (
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
  );

  // Render detailed view (8 individual sites)
  const renderDetailedBody = () => (
    <tbody>
      {SITE_GROUPS.map((group, groupIndex) =>
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
              {visibleQuestions.map((painType) => {
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
                  return <td key={`${site}-${painType}`} className="p-1 text-center" />;
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
      )}
    </tbody>
  );

  // Render grouped view (3 muscle groups with aggregated values)
  const renderGroupedBody = () => (
    <tbody>
      {MUSCLE_GROUP_KEYS.map((group, groupIndex) => {
        const isLastGroup = groupIndex === MUSCLE_GROUP_KEYS.length - 1;

        return (
          <tr
            key={group}
            className={cn("border-b", !isLastGroup && "border-b-2 border-muted-foreground/30")}
          >
            <td className="p-2">
              <span className="font-medium">{MUSCLE_GROUPS[group]}</span>
            </td>
            {visibleQuestions.map((painType) => {
              // Check if this pain type applies to this group
              const applies = appliesToGroup(group, painType);

              if (!applies) {
                return (
                  <td
                    key={`${group}-${painType}`}
                    className="p-1 text-center text-muted-foreground"
                  >
                    —
                  </td>
                );
              }

              const enabled = isGroupEnabled(group, painType);
              const aggregatedValue = getGroupValue(group, painType);

              return (
                <td key={`${group}-${painType}`} className="p-1">
                  <div className="flex justify-center">
                    <YesNoInput
                      value={aggregatedValue}
                      onChange={(newValue) => {
                        setGroupValue(group, painType, newValue);
                      }}
                      disabled={!enabled}
                    />
                  </div>
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {renderHeader()}
        {siteDetailMode === "detailed" ? renderDetailedBody() : renderGroupedBody()}
      </table>
    </div>
  );
}
