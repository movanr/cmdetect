/**
 * Examination E10 Section Route
 *
 * E10: Supplemental Muscle Palpation examination section.
 * Last section of the Examination workflow.
 *
 * URL pattern: /cases/$id/examination/e10
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E10Section, useExaminationPersistenceContext } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e10")({
  component: ExaminationE10Page,
});

function ExaminationE10Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { completeExamination } = useExaminationPersistenceContext();

  // Complete examination and navigate to evaluation (last section)
  const handleComplete = async () => {
    await completeExamination();
    navigate({
      to: "/cases/$id/evaluation",
      params: { id },
    });
  };

  // Navigate to previous section (E9)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e9",
      params: { id },
    });
  };

  return (
    <E10Section
      onComplete={handleComplete}
      onBack={handleBack}
      isLastSection
    />
  );
}
