import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { CaseWorkflowProvider } from "../features/case-workflow";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { useRole } from "../contexts/RoleContext";
import { getTranslations } from "../config/i18n";
import { roles } from "@cmdetect/config";

export const Route = createFileRoute("/cases_/$id")({
  component: CaseRoute,
});

// This component provides workflow context to all child routes
function CaseRoute() {
  const { id } = Route.useParams();
  const { activeRole, availableRoles, isLoading } = useRole();
  const navigate = useNavigate();
  const t = getTranslations();

  const isClinicalRole =
    activeRole === roles.PHYSICIAN || activeRole === roles.ASSISTANT;

  const hasClinicalRole =
    availableRoles.includes(roles.PHYSICIAN) || availableRoles.includes(roles.ASSISTANT);

  useEffect(() => {
    if (!isLoading && activeRole && !isClinicalRole) {
      toast.info(hasClinicalRole
        ? t.accessControl.clinicalRoleRequiredCanSwitch
        : t.accessControl.clinicalRoleRequired);
      navigate({ to: "/cases" });
    }
  }, [isLoading, activeRole, isClinicalRole, hasClinicalRole, navigate, t]);

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
