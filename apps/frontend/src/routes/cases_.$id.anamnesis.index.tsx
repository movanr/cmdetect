/**
 * Anamnesis Index Route
 *
 * Redirects to the first sub-step (review) when accessing /cases/$id/anamnesis directly.
 */

import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/cases_/$id/anamnesis/")({
  component: AnamnesisIndexRedirect,
});

function AnamnesisIndexRedirect() {
  const { id } = Route.useParams();
  return <Navigate to="/cases/$id/anamnesis/review" params={{ id }} replace />;
}
