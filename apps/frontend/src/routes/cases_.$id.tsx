import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CaseWorkflowProvider } from "../features/case-workflow";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { useRole } from "../contexts/RoleContext";
import { roles } from "@cmdetect/config";

export const Route = createFileRoute("/cases_/$id")({
  component: CaseRoute,
});

// This component provides workflow context to all child routes
function CaseRoute() {
  const { id } = Route.useParams();
  const { activeRole, isLoading } = useRole();
  const navigate = useNavigate();

  const isClinicalRole =
    activeRole === roles.PHYSICIAN || activeRole === roles.ASSISTANT;

  useEffect(() => {
    if (!isLoading && activeRole && !isClinicalRole) {
      navigate({ to: "/cases" });
    }
  }, [isLoading, activeRole, isClinicalRole, navigate]);

  // Redirect to login when session has expired (not still loading)
  useEffect(() => {
    if (!isLoading && !activeRole) {
      navigate({ to: "/login" });
    }
  }, [isLoading, activeRole, navigate]);

  // Don't render case workflow while loading, redirecting, or for non-clinical roles
  if (isLoading || !activeRole || !isClinicalRole) {
    return null;
  }

  return (
    <KeySetupGuard>
      <CaseWorkflowProvider caseId={id}>
        <Outlet />
      </CaseWorkflowProvider>
    </KeySetupGuard>
  );
}
