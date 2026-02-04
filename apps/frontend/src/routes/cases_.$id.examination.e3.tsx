/**
 * Examination E3 Section Route
 *
 * E3: Opening Pattern (Supplemental) examination section.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E3Section } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e3")({
  component: ExaminationE3Page,
});

function ExaminationE3Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Navigate to next section (E4) on completion
  const handleComplete = () => {
    navigate({
      to: "/cases/$id/examination/e4",
      params: { id },
    });
  };

  // Skip also navigates to next section
  const handleSkip = () => {
    navigate({
      to: "/cases/$id/examination/e4",
      params: { id },
    });
  };

  // Navigate to previous section (E2)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e2",
      params: { id },
    });
  };

  return <E3Section onComplete={handleComplete} onSkip={handleSkip} onBack={handleBack} />;
}
