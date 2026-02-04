/**
 * Examination E4 Section Route
 *
 * E4: Opening and Closing Movements examination section.
 *
 * URL pattern: /cases/$id/examination/e4?step=1 (1-indexed)
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { E4Section } from "../features/examination";

const e4SearchSchema = z.object({
  step: z.coerce.number().min(1).optional(),
});

export const Route = createFileRoute("/cases_/$id/examination/e4")({
  validateSearch: (search) => e4SearchSchema.parse(search),
  component: ExaminationE4Page,
});

function ExaminationE4Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const navigate = useNavigate();

  // Navigate to a specific step (0-indexed), or null for summary view
  const navigateToStep = (stepIndex: number | null) => {
    if (stepIndex === null) {
      // Summary view - no step param
      navigate({ to: "/cases/$id/examination/e4", params: { id }, search: {} });
    } else {
      // Convert 0-indexed to 1-indexed for URL
      navigate({ to: "/cases/$id/examination/e4", params: { id }, search: { step: stepIndex + 1 } });
    }
  };

  // Navigate to next section (E9) on completion
  const handleComplete = () => {
    navigate({
      to: "/cases/$id/examination/e9",
      params: { id },
      search: {},
    });
  };

  // Navigate to previous section (E3)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e3",
      params: { id },
      search: {},
    });
  };

  return (
    <E4Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
