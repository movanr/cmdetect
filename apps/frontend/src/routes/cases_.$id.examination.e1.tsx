/**
 * Examination E1 Section Route
 *
 * E1: Pain & Headache Location examination section.
 * First section of the Examination workflow.
 *
 * URL pattern: /cases/$id/examination/e1?step=1 (1-indexed)
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { E1Section } from "../features/examination";

const e1SearchSchema = z.object({
  step: z.coerce.number().min(1).optional(),
});

export const Route = createFileRoute("/cases_/$id/examination/e1")({
  validateSearch: (search) => e1SearchSchema.parse(search),
  component: ExaminationE1Page,
});

function ExaminationE1Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const navigate = useNavigate();

  // Navigate to a specific step (0-indexed), or null for summary view
  const navigateToStep = (stepIndex: number | null) => {
    if (stepIndex === null) {
      // Summary view - no step param
      navigate({ to: "/cases/$id/examination/e1", params: { id }, search: {} });
    } else {
      // Convert 0-indexed to 1-indexed for URL
      navigate({ to: "/cases/$id/examination/e1", params: { id }, search: { step: stepIndex + 1 } });
    }
  };

  // Navigate to next section (E2) on completion
  const handleComplete = () => {
    navigate({
      to: "/cases/$id/examination/e2",
      params: { id },
      search: {},
    });
  };

  return (
    <E1Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      isFirstSection
    />
  );
}
