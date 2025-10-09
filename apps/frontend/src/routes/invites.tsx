import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { InvitesView } from "../features/invites/InvitesView";
import { Button } from "../components/ui/button";
import { getTranslations } from "../config/i18n";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/invites")({
  component: InvitesPage,
});

function InvitesPage() {
  const t = getTranslations();

  return (
    <KeySetupGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {t.nav.invites}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t.pageDescriptions.invites}
              </p>
            </div>
            <Button asChild>
              <Link to="/invites/new">
                <Plus className="h-4 w-4 mr-2" />
                {t.actions.createNewInvite}
              </Link>
            </Button>
          </div>

          {/* Content */}
          <InvitesView />
        </div>
      </AppLayout>
    </KeySetupGuard>
  );
}
