import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CaseWorkflowProvider } from "../features/case-workflow";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";

export const Route = createFileRoute("/cases_/$id")({
  component: CaseRoute,
});

// This component provides workflow context to all child routes
function CaseRoute() {
  const { id } = Route.useParams();

  return (
    <KeySetupGuard>
      <CaseWorkflowProvider caseId={id}>
        <Outlet />
      </CaseWorkflowProvider>
    </KeySetupGuard>
  );
}
