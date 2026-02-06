import { E3_OPENING_PATTERNS } from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

export function E3Summary() {
  const { getValues } = useFormContext<FormValues>();

  const pattern = getValues("e3.pattern") as string | null;
  const patternLabel = pattern
    ? (E3_OPENING_PATTERNS[pattern as keyof typeof E3_OPENING_PATTERNS] ?? pattern)
    : "—";

  return (
    <SummarySection sectionId="e3">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="font-medium text-muted-foreground">Öffnungsmuster</dt>
        <dd>{patternLabel}</dd>
      </dl>
    </SummarySection>
  );
}
