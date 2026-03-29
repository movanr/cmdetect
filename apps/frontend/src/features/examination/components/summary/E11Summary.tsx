import { useFormContext } from "react-hook-form";
import type { FormValues } from "../../form/use-examination-form";
import { SummarySection } from "./SummarySection";

export function E11Summary() {
  const { getValues } = useFormContext<FormValues>();
  const comment = getValues("e11.comment") as string | null | undefined;

  if (!comment || comment.trim().length === 0) return null;

  return (
    <SummarySection sectionId="e11">
      <p className="text-sm whitespace-pre-wrap">{comment}</p>
    </SummarySection>
  );
}
