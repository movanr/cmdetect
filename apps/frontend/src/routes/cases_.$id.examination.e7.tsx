/**
 * Examination E7 Section Route
 *
 * E7: TMJ Sounds during Lateral and Protrusive Movements.
 * Single-step section (no multi-step URL).
 */

import { createFileRoute } from "@tanstack/react-router";
import { E7Section, useExaminationRouteNavigation } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e7")({
  component: ExaminationE7Page,
});

function ExaminationE7Page() {
  const { id } = Route.useParams();
  const { handleComplete, handleBack } = useExaminationRouteNavigation({ section: "e7", id });

  return <E7Section onComplete={handleComplete} onBack={handleBack} />;
}
