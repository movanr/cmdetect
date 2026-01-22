/**
 * Examination E9 Section Route
 *
 * E9: Muscle and TMJ Palpation examination section.
 * Second section of the Examination workflow.
 */

import { createFileRoute } from "@tanstack/react-router";
import { E9Section } from "../features/examination-v2";

export const Route = createFileRoute("/cases_/$id/examination/e9")({
  component: ExaminationE9Page,
});

function ExaminationE9Page() {
  return <E9Section />;
}
