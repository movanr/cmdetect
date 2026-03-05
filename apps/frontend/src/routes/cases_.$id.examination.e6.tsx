/**
 * Examination E6 Section Route
 *
 * E6: TMJ Sounds during Opening and Closing Movements.
 * Single-step section (no multi-step URL).
 */

import { createFileRoute } from "@tanstack/react-router";
import { E6Section, useExaminationRouteNavigation } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e6")({
  component: ExaminationE6Page,
});

function ExaminationE6Page() {
  const { id } = Route.useParams();
  const { handleComplete, handleBack } = useExaminationRouteNavigation({ section: "e6", id });

  return <E6Section onComplete={handleComplete} onBack={handleBack} />;
}
