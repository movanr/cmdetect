/**
 * Examination E4 Section Route
 *
 * E4: Opening and Closing Movements examination section.
 *
 * URL pattern: /cases/$id/examination/e4?step=1 (1-indexed)
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  E4Section,
  examinationStepSearchSchema,
  useExaminationRouteNavigation,
} from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e4")({
  validateSearch: (search) => examinationStepSearchSchema.parse(search),
  component: ExaminationE4Page,
});

function ExaminationE4Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const { navigateToStep, handleComplete, handleBack } =
    useExaminationRouteNavigation({ section: "e4", id, hasSteps: true });

  return (
    <E4Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
}
