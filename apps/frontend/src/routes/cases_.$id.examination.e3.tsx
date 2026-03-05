/**
 * Examination E3 Section Route
 *
 * E3: Opening Pattern (Supplemental) examination section.
 */

import { createFileRoute } from "@tanstack/react-router";
import { E3Section, useExaminationRouteNavigation } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e3")({
  component: ExaminationE3Page,
});

function ExaminationE3Page() {
  const { id } = Route.useParams();
  const { handleComplete, handleBack } = useExaminationRouteNavigation({ section: "e3", id });

  return <E3Section onComplete={handleComplete} onBack={handleBack} />;
}
