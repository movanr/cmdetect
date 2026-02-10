/**
 * Examination E9 Section Route
 *
 * E9: Muscle and TMJ Palpation examination section.
 * Last section of the Examination workflow.
 *
 * URL pattern: /cases/$id/examination/e9?step=1 (1-indexed)
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { E9Section, useExaminationPersistenceContext } from "../features/examination";

const e9SearchSchema = z.object({
  step: z.coerce.number().min(1).optional(),
});

export const Route = createFileRoute("/cases_/$id/examination/e9")({
  validateSearch: (search) => e9SearchSchema.parse(search),
  component: ExaminationE9Page,
});

function ExaminationE9Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const navigate = useNavigate();
  const { completeExamination } = useExaminationPersistenceContext();

  // Navigate to a specific step (0-indexed), or null for summary view
  const navigateToStep = (stepIndex: number | null) => {
    if (stepIndex === null) {
      // Summary view - no step param
      navigate({ to: "/cases/$id/examination/e9", params: { id }, search: {} });
    } else {
      // Convert 0-indexed to 1-indexed for URL
      navigate({ to: "/cases/$id/examination/e9", params: { id }, search: { step: stepIndex + 1 } });
    }
  };

  // Complete examination and navigate to evaluation (last section)
  const handleComplete = async () => {
    await completeExamination();
    navigate({
      to: "/cases/$id/evaluation",
      params: { id },
    });
  };

  // Navigate to previous section (E8)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e8",
      params: { id },
    });
  };

  return (
    <E9Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
      isLastSection
    />
  );
}
