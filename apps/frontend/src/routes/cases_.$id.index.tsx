import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/cases_/$id/")({
  component: CaseIndexRedirect,
});

// Redirect to the first step (anamnesis) by default when accessing /cases/$id
function CaseIndexRedirect() {
  const { id } = Route.useParams();
  return <Navigate to="/cases/$id/anamnesis" params={{ id }} replace />;
}
