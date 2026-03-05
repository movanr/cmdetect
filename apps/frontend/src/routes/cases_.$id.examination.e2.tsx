/**
 * Examination E2 Section Route
 *
 * E2: Incisal Relationships examination section.
 *
 * URL pattern: /cases/$id/examination/e2?step=1 (1-indexed)
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  E2Section,
  examinationStepSearchSchema,
  useExaminationRouteNavigation,
} from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e2")({
  validateSearch: (search) => examinationStepSearchSchema.parse(search),
  component: ExaminationE2Page,
});

function ExaminationE2Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const { navigateToStep, handleComplete, handleBack } =
    useExaminationRouteNavigation({ section: "e2", id, hasSteps: true });

  return (
    <E2Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
