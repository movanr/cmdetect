/**
 * Examination E2 Section Route
 *
 * E2: Incisal Relationships examination section.
 *
 * URL pattern: /cases/$id/examination/e2?step=1 (1-indexed)
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { E2Section, useExaminationPersistenceContext } from "../features/examination";

const e2SearchSchema = z.object({
  step: z.coerce.number().min(1).optional(),
});

export const Route = createFileRoute("/cases_/$id/examination/e2")({
  validateSearch: (search) => e2SearchSchema.parse(search),
  component: ExaminationE2Page,
});

function ExaminationE2Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const navigate = useNavigate();
  const { saveSection } = useExaminationPersistenceContext();

  // Navigate to a specific step (0-indexed), or null for summary view
  const navigateToStep = (stepIndex: number | null) => {
    if (stepIndex === null) {
      // Summary view - no step param
      navigate({ to: "/cases/$id/examination/e2", params: { id }, search: {} });
    } else {
      // Convert 0-indexed to 1-indexed for URL
      navigate({ to: "/cases/$id/examination/e2", params: { id }, search: { step: stepIndex + 1 } });
    }
  };

  // Save section and navigate to next section (E3) on completion
  const handleComplete = async () => {
    await saveSection("e2");
    navigate({
      to: "/cases/$id/examination/e3",
      params: { id },
      search: {},
    });
  };

  // Navigate to previous section (E1)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e1",
      params: { id },
      search: {},
    });
  };

  return (
    <E2Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
