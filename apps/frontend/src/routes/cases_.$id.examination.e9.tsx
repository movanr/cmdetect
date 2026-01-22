/**
 * Examination E9 Section Route
 *
 * E9: Muscle and TMJ Palpation examination section.
 * Last section of the Examination workflow.
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E9Section } from "../features/examination-v2";

export const Route = createFileRoute("/cases_/$id/examination/e9")({
  component: ExaminationE9Page,
});

function ExaminationE9Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Navigate to case overview on completion (last section)
  const handleComplete = () => {
    navigate({
      to: "/cases/$id",
      params: { id },
    });
  };

  // Skip also navigates to case overview
  const handleSkip = () => {
    navigate({
      to: "/cases/$id",
      params: { id },
    });
  };

  return <E9Section onComplete={handleComplete} onSkip={handleSkip} isLastSection />;
}
