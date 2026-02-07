/**
 * Examination E8 Section Route
 *
 * E8: Joint Locking (Gelenkblockierung).
 * Single-step section (no multi-step URL).
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E8Section, useExaminationPersistenceContext } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e8")({
  component: ExaminationE8Page,
});

function ExaminationE8Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { saveSection } = useExaminationPersistenceContext();

  // Save section and navigate to next section (E9) on completion
  const handleComplete = async () => {
    await saveSection("e8");
    navigate({
      to: "/cases/$id/examination/e9",
      params: { id },
    });
  };

  // Navigate to previous section (E7)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e7",
      params: { id },
    });
  };

  return <E8Section onComplete={handleComplete} onBack={handleBack} />;
}
