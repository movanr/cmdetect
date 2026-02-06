import { E1_HEADACHE_LOCATIONS, E1_PAIN_LOCATIONS } from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";
import { buildRegionSummary } from "./summary-helpers";

export function E1Summary() {
  const { getValues } = useFormContext<FormValues>();

  const painRight = getValues("e1.painLocation.right") as string[] | undefined;
  const painLeft = getValues("e1.painLocation.left") as string[] | undefined;
  const headacheRight = getValues("e1.headacheLocation.right") as string[] | undefined;
  const headacheLeft = getValues("e1.headacheLocation.left") as string[] | undefined;

  const painSummary = buildRegionSummary(painRight, painLeft, E1_PAIN_LOCATIONS, "Kein Schmerz");
  const headacheSummary = buildRegionSummary(
    headacheRight,
    headacheLeft,
    E1_HEADACHE_LOCATIONS,
    "Keine Kopfschmerzen"
  );

  return (
    <SummarySection sectionId="e1">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="font-medium text-muted-foreground">Schmerzlokalisation</dt>
        <dd>{painSummary}</dd>
        <dt className="font-medium text-muted-foreground">Kopfschmerzlokalisation</dt>
        <dd>{headacheSummary}</dd>
      </dl>
    </SummarySection>
  );
}
