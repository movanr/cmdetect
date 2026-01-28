/**
 * Examination E2 Section Route
 *
 * E2: Incisal Relationships examination section.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E2Section } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e2")({
  component: ExaminationE2Page,
});

function ExaminationE2Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Navigate to next section (E3) on completion
  const handleComplete = () => {
    navigate({
      to: "/cases/$id/examination/e3",
      params: { id },
    });
  };

  // Skip also navigates to next section
  const handleSkip = () => {
    navigate({
      to: "/cases/$id/examination/e3",
      params: { id },
    });
  };

  return <E2Section onComplete={handleComplete} onSkip={handleSkip} />;
}
