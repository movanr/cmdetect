import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { TeamView } from "../features/team/TeamView";
import { getTranslations } from "../config/i18n";
import { useRole } from "../contexts/RoleContext";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { roles } from "@cmdetect/config";

export const Route = createFileRoute("/team")({
  component: TeamPage,
});

function TeamPage() {
  const t = getTranslations();
  const { hasRole } = useRole();

  // Only org_admin can access this page
  if (!hasRole(roles.ORG_ADMIN)) {
    return (
      <AppLayout>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">
                  {t.accessControl.accessDenied}
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  {t.accessControl.adminPrivilegesRequired}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <KeySetupGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {t.nav.team}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t.pageDescriptions.team}
              </p>
            </div>
            {/* TODO: Add "Invite User" button */}
          </div>

          {/* Content */}
          <TeamView />
        </div>
      </AppLayout>
    </KeySetupGuard>
  );
}
