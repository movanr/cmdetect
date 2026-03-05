/**
 * Examination E10 Section Route
 *
 * E10: Supplemental Muscle Palpation examination section.
 * Last section of the Examination workflow.
 *
 * URL pattern: /cases/$id/examination/e10
 */

import { createFileRoute } from "@tanstack/react-router";
import { E10Section, useExaminationRouteNavigation } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e10")({
  component: ExaminationE10Page,
});

function ExaminationE10Page() {
  const { id } = Route.useParams();
  const { handleComplete, handleBack, isLastSection } =
    useExaminationRouteNavigation({ section: "e10", id });

  return (
    <E10Section onComplete={handleComplete} onBack={handleBack} isLastSection={isLastSection} />
  );
}
