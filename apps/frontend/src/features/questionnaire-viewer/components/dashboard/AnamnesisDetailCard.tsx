/**
 * Anamnesis Detail Card - Shows SQ → Diagnosis category mapping.
 *
 * Displays the inverse relationship: which SQ questions feed into
 * which diagnosis categories, with criteria and their evaluation status.
 * Groups with the same categoryLabel are merged and criteria deduplicated.
 * Only renders categories where at least one group has positive anamnesis.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getGroupedAnamnesisCriteria,
  getSectionBadge,
  type AnamnesisCriterionDetail,
  type SectionId,
} from "@cmdetect/dc-tmd";
import { useMemo } from "react";

interface AnamnesisDetailCardProps {
  sqAnswers: Record<string, unknown>;
}

/** Merged category: groups with the same categoryLabel combined. */
interface MergedCategory {
  categoryLabel: string;
  /** Deduplicated positive criteria from all groups in this category */
  criteria: AnamnesisCriterionDetail[];
  /** Deduplicated exam sections from all groups in this category */
  examinationSections: SectionId[];
}

export function AnamnesisDetailCard({ sqAnswers }: AnamnesisDetailCardProps) {
  const merged = useMemo(() => {
    const groups = getGroupedAnamnesisCriteria(sqAnswers);
    const positiveGroups = groups.filter((g) => g.groupStatus === "positive");

    // Merge groups by categoryLabel, deduplicate criteria by id and exam sections
    const categoryMap = new Map<
      string,
      { criteria: Map<string, AnamnesisCriterionDetail>; sections: Set<SectionId> }
    >();
    const categoryOrder: string[] = [];

    for (const group of positiveGroups) {
      if (!categoryMap.has(group.categoryLabel)) {
        categoryMap.set(group.categoryLabel, { criteria: new Map(), sections: new Set() });
        categoryOrder.push(group.categoryLabel);
      }
      const entry = categoryMap.get(group.categoryLabel)!;
      for (const c of group.criteria) {
        if (c.status === "positive" && !entry.criteria.has(c.id)) {
          entry.criteria.set(c.id, c);
        }
      }
      for (const s of group.examinationSections) {
        entry.sections.add(s);
      }
    }

    const result: MergedCategory[] = [];
    for (const label of categoryOrder) {
      const entry = categoryMap.get(label)!;
      const criteria = [...entry.criteria.values()];
      if (criteria.length > 0) {
        result.push({
          categoryLabel: label,
          criteria,
          examinationSections: [...entry.sections].sort(),
        });
      }
    }
    return result;
  }, [sqAnswers]);

  if (merged.length === 0) return null;

  return (
    <div className="space-y-2 text-sm">
      {merged.map((cat) => (
        <div key={cat.categoryLabel} className="rounded-md border border-border/50 px-3 py-2">
          {/* Category header with exam section badges */}
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-foreground flex-1 min-w-0">
              {cat.categoryLabel}
            </p>
            {cat.examinationSections.length > 0 && (
              <div className="flex gap-1 shrink-0">
                {cat.examinationSections.map((sectionId) => (
                  <Badge
                    key={sectionId}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 font-normal"
                  >
                    {getSectionBadge(sectionId)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Positive criteria */}
          <div className="mt-1.5 space-y-0.5">
            {cat.criteria.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full shrink-0 mt-1.5",
                    "bg-blue-500"
                  )}
                />
                <span className="flex-1 min-w-0 text-xs text-muted-foreground">{c.label}</span>
                {c.sqQuestionIds.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {c.sqQuestionIds.map((id) => (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground"
                      >
                        {id.replace("SQ", "SF")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
