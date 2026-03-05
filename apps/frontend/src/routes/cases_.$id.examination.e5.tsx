/**
 * Examination E5 Section Route
 *
 * E5: Lateral and Protrusive Movements examination section.
 *
 * URL pattern: /cases/$id/examination/e5?step=1 (1-indexed)
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  E5Section,
  examinationStepSearchSchema,
  useExaminationRouteNavigation,
} from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e5")({
  validateSearch: (search) => examinationStepSearchSchema.parse(search),
  component: ExaminationE5Page,
});

function ExaminationE5Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const { navigateToStep, handleComplete, handleBack } =
    useExaminationRouteNavigation({ section: "e5", id, hasSteps: true });

  return (
    <E5Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
