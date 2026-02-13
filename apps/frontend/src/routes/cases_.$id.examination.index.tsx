/**
 * Examination Index Route
 *
 * Redirects to the first section (E1) when accessing /cases/$id/examination directly.
 */

import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/cases_/$id/examination/")({
  component: ExaminationIndexRedirect,
});

function ExaminationIndexRedirect() {
  const { id } = Route.useParams();
  return <Navigate to="/cases/$id/examination/e1" params={{ id }} replace />;
}
