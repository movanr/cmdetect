/**
 * Examination E9 Section Route
 *
 * E9: Muscle and TMJ Palpation examination section.
 *
 * URL pattern: /cases/$id/examination/e9?step=1 (1-indexed)
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  E9Section,
  examinationStepSearchSchema,
  useExaminationRouteNavigation,
} from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e9")({
  validateSearch: (search) => examinationStepSearchSchema.parse(search),
  component: ExaminationE9Page,
});

function ExaminationE9Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const { navigateToStep, handleComplete, handleBack, isLastSection } =
    useExaminationRouteNavigation({ section: "e9", id, hasSteps: true, skipSave: true });

  return (
    <E9Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      onBack={handleBack}
      isLastSection={isLastSection}
    />
  );
}
