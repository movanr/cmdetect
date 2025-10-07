import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { CreateInviteForm } from "../features/invites/CreateInviteForm";
import { getTranslations } from "../config/i18n";

export const Route = createFileRoute("/invites_/new")({
  component: CreateInvitePage,
});

function CreateInvitePage() {
  const t = getTranslations();

  return (
    <KeySetupGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Create New Invite
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a new patient invitation link
            </p>
          </div>

          {/* Form */}
          <CreateInviteForm />
        </div>
      </AppLayout>
    </KeySetupGuard>
  );
}
