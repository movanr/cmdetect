import { E2_MIDLINE_DIRECTIONS, E2_REFERENCE_TEETH } from "@cmdetect/dc-tmd";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

export function E2Summary() {
  const { getValues } = useFormContext<FormValues>();

  const toothSelection = getValues("e2.referenceTooth.selection") as string | null;
  const toothOther = getValues("e2.referenceTooth.otherTooth") as string | null;
  const horizontalOverjet = getValues("e2.horizontalOverjet") as number | null;
  const verticalOverlap = getValues("e2.verticalOverlap") as number | null;
  const midlineDirection = getValues("e2.midlineDeviation.direction") as string | null;
  const midlineMm = getValues("e2.midlineDeviation.mm") as number | null;

  const toothLabel =
    toothSelection === "other"
      ? toothOther ?? "—"
      : toothSelection
        ? (E2_REFERENCE_TEETH[toothSelection as keyof typeof E2_REFERENCE_TEETH] ?? toothSelection)
        : "—";

  const midlineLabel = (() => {
    if (!midlineDirection) return "—";
    if (midlineDirection === "na") return "N/A";
    const dirLabel = E2_MIDLINE_DIRECTIONS[midlineDirection as keyof typeof E2_MIDLINE_DIRECTIONS] ?? midlineDirection;
    return midlineMm != null ? `${midlineMm} mm nach ${dirLabel.toLowerCase()}` : dirLabel;
  })();

  return (
    <SummarySection sectionId="e2">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="font-medium text-muted-foreground">Referenzzahn</dt>
        <dd>{toothLabel}</dd>
        <dt className="font-medium text-muted-foreground">Horizontaler Überbiss</dt>
        <dd>{horizontalOverjet != null ? `${horizontalOverjet} mm` : "—"}</dd>
        <dt className="font-medium text-muted-foreground">Vertikaler Überbiss</dt>
        <dd>{verticalOverlap != null ? `${verticalOverlap} mm` : "—"}</dd>
        <dt className="font-medium text-muted-foreground">Mittellinienabweichung</dt>
        <dd>{midlineLabel}</dd>
      </dl>
    </SummarySection>
  );
}
