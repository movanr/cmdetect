/**
 * Examination E4 Section Route
 *
 * E4: Opening and Closing Movements examination section.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E4Section } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e4")({
  component: ExaminationE4Page,
});

function ExaminationE4Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Navigate to next section (E9) on completion
  const handleComplete = () => {
    navigate({
      to: "/cases/$id/examination/e9",
      params: { id },
    });
  };

  // Skip also navigates to next section
  const handleSkip = () => {
    navigate({
      to: "/cases/$id/examination/e9",
      params: { id },
    });
  };

  return <E4Section onComplete={handleComplete} onSkip={handleSkip} />;
}
