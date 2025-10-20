import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/cases_/$id")({
  component: CaseRoute,
});

// This component renders the outlet for child routes
function CaseRoute() {
  return <Outlet />;
}
