/**
 * Examination E5 Section Route
 *
 * E5: Lateral and Protrusive Movements examination section.
 *
 * URL pattern: /cases/$id/examination/e5?step=1 (1-indexed)
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { E5Section, useExaminationPersistenceContext } from "../features/examination";

const e5SearchSchema = z.object({
  step: z.coerce.number().min(1).optional(),
});

export const Route = createFileRoute("/cases_/$id/examination/e5")({
  validateSearch: (search) => e5SearchSchema.parse(search),
  component: ExaminationE5Page,
});

function ExaminationE5Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const navigate = useNavigate();
  const { saveSection } = useExaminationPersistenceContext();

  // Navigate to a specific step (0-indexed), or null for summary view
  const navigateToStep = (stepIndex: number | null) => {
    if (stepIndex === null) {
      // Summary view - no step param
      navigate({ to: "/cases/$id/examination/e5", params: { id }, search: {} });
    } else {
      // Convert 0-indexed to 1-indexed for URL
      navigate({ to: "/cases/$id/examination/e5", params: { id }, search: { step: stepIndex + 1 } });
    }
  };

  // Save section and navigate to next section (E9) on completion
  const handleComplete = async () => {
    await saveSection("e5");
    navigate({
      to: "/cases/$id/examination/e9",
      params: { id },
      search: {},
    });
  };

  // Navigate to previous section (E4)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e4",
      params: { id },
      search: {},
    });
  };

  return (
    <E5Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
