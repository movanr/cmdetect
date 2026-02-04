/**
 * Examination E1 Section Route
 *
 * E1: Pain & Headache Location examination section.
 * First section of the Examination workflow.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E1Section } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e1")({
  component: ExaminationE1Page,
});

function ExaminationE1Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Navigate to next section (E2) on completion
  const handleComplete = () => {
    navigate({
      to: "/cases/$id/examination/e2",
      params: { id },
    });
  };

  // Skip also navigates to next section
  const handleSkip = () => {
    navigate({
      to: "/cases/$id/examination/e2",
      params: { id },
    });
  };

  return <E1Section onComplete={handleComplete} onSkip={handleSkip} isFirstSection />;
}
