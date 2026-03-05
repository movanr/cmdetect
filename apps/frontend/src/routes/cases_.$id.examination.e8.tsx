/**
 * Examination E8 Section Route
 *
 * E8: Joint Locking (Gelenkblockierung).
 * Single-step section (no multi-step URL).
 */

import { createFileRoute } from "@tanstack/react-router";
import { E8Section, useExaminationRouteNavigation } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e8")({
  component: ExaminationE8Page,
});

function ExaminationE8Page() {
  const { id } = Route.useParams();
  const { handleComplete, handleBack } = useExaminationRouteNavigation({ section: "e8", id });

  return <E8Section onComplete={handleComplete} onBack={handleBack} />;
}
