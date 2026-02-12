/**
 * Examination Index Route
 *
 * Redirects to the first section (E1) when accessing /cases/$id/examination directly.
 * Preserves parent search params (e.g., mode=preview) in the redirect.
 */

import { createFileRoute, Navigate, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/cases_/$id/examination/")({
  component: ExaminationIndexRedirect,
});

function ExaminationIndexRedirect() {
  const { id } = Route.useParams();
  // Use generic useSearch to capture parent route's search params (e.g., mode=preview)
  const search = useSearch({ strict: false });
  return <Navigate to="/cases/$id/examination/e1" params={{ id }} search={search} replace />;
}
