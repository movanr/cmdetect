/**
 * Examination E1 Section Route
 *
 * E1: Pain & Headache Location examination section.
 * First section of the Examination workflow.
 *
 * URL pattern: /cases/$id/examination/e1?step=1 (1-indexed)
 */

import { createFileRoute } from "@tanstack/react-router";
import {
  E1Section,
  examinationStepSearchSchema,
  useExaminationRouteNavigation,
} from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e1")({
  validateSearch: (search) => examinationStepSearchSchema.parse(search),
  component: ExaminationE1Page,
});

function ExaminationE1Page() {
  const { id } = Route.useParams();
  const { step } = Route.useSearch();
  const { navigateToStep, handleComplete, isFirstSection } =
    useExaminationRouteNavigation({ section: "e1", id, hasSteps: true });

  return (
    <E1Section
      step={step}
      onStepChange={navigateToStep}
      onComplete={handleComplete}
      isFirstSection={isFirstSection}
    />
  );
}
