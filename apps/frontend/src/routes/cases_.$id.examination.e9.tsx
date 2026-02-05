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
import { E9Section } from "../features/examination";

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

  // Navigate to case overview on completion (last section)
  const handleComplete = () => {
    navigate({
      to: "/cases/$id",
      params: { id },
    });
  };

  // Navigate to previous section (E4)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e4",
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
