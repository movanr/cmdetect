import { InvitesView } from "@/features/patient-records/components/InvitesView";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AppLayout } from "../components/layouts/AppLayout";
import { Button } from "../components/ui/button";
import { getTranslations } from "../config/i18n";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { cn } from "../lib/utils";

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
              <h1 className="text-3xl font-semibold tracking-tight">{t.nav.patients}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t.pageDescriptions.invites}</p>
            </div>
            <Button asChild>
              <Link to="/invites/new">
                <Plus className="h-4 w-4 mr-2" />
                {t.actions.createNewInvite}
              </Link>
            </Button>
          </div>

          {/* View toggle */}
          <div className="flex gap-2 border-b">
            <Link
              to="/cases"
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.nav.cases}
            </Link>
            <Link
              to="/invites"
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px border-primary text-foreground"
              )}
            >
              {t.nav.invites}
            </Link>
          </div>

          {/* Content */}
          <InvitesView />
        </div>
      </AppLayout>
    </KeySetupGuard>
  );
}
