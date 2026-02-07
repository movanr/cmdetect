/**
 * Examination E7 Section Route
 *
 * E7: TMJ Sounds during Lateral and Protrusive Movements.
 * Single-step section (no multi-step URL).
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { E7Section, useExaminationPersistenceContext } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/examination/e7")({
  component: ExaminationE7Page,
});

function ExaminationE7Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { saveSection } = useExaminationPersistenceContext();

  // Save section and navigate to next section (E8) on completion
  const handleComplete = async () => {
    await saveSection("e7");
    navigate({
      to: "/cases/$id/examination/e8",
      params: { id },
    });
  };

  // Navigate to previous section (E6)
  const handleBack = () => {
    navigate({
      to: "/cases/$id/examination/e6",
      params: { id },
    });
  };

  return <E7Section onComplete={handleComplete} onBack={handleBack} />;
}
