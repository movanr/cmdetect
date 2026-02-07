/**
 * Examination E6 Section Route
 *
 * E6: TMJ Sounds during Opening and Closing Movements.
 * Single-step section (no multi-step URL).
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E6Section, useExaminationPersistenceContext } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e6")({
  component: ExaminationE6Page,
});

function ExaminationE6Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { saveSection } = useExaminationPersistenceContext();

  // Save section and navigate to next section (E7) on completion
  const handleComplete = async () => {
    await saveSection("e6");
    navigate({
      to: "/cases/$id/examination/e7",
      params: { id },
    });
  };

  // Navigate to previous section (E5)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e5",
      params: { id },
    });
  };

  return <E6Section onComplete={handleComplete} onBack={handleBack} />;
}
