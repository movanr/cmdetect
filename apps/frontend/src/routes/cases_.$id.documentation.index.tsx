/**
 * Documentation Index Route
 *
 * Redirects to the first sub-step (report) when accessing /cases/$id/documentation directly.
 */

import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/cases_/$id/documentation/")({
  component: DocumentationIndexRedirect,
});

function DocumentationIndexRedirect() {
  const { id } = Route.useParams();
  return <Navigate to="/cases/$id/documentation/report" params={{ id }} replace />;
}
