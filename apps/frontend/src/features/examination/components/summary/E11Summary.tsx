import { Badge } from "@/components/ui/badge";
import { getSectionBadge, SECTION_LABELS, type SectionId } from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

const COMMENT_SECTIONS: SectionId[] = [
  "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "e10",
];

export function E11Summary() {
  const { getValues } = useFormContext<FormValues>();

  const entries = COMMENT_SECTIONS
    .map((sectionId) => ({
      sectionId,
      value: getValues(`e11.${sectionId}`) as string | null | undefined,
    }))
    .filter((e) => typeof e.value === "string" && e.value.trim().length > 0);

  if (entries.length === 0) return null;

  return (
    <SummarySection sectionId="e11">
      <dl className="space-y-2 text-sm">
        {entries.map(({ sectionId, value }) => (
          <div key={sectionId} className="flex items-baseline gap-3">
            <dt className="flex items-center gap-2 shrink-0">
              <Badge variant="outline">{getSectionBadge(sectionId)}</Badge>
              <span className="font-medium text-muted-foreground">
                {SECTION_LABELS[sectionId].short}
              </span>
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </SummarySection>
  );
}
