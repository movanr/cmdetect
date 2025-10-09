import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { CasesView } from "../features/cases/CasesView";
import { getTranslations } from "../config/i18n";

export const Route = createFileRoute("/cases")({
  component: CasesPage,
});

function CasesPage() {
  const t = getTranslations();

  return (
    <KeySetupGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {t.nav.cases}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review patient submissions and manage cases
              </p>
            </div>
          </div>

          {/* Content */}
          <CasesView />
        </div>
      </AppLayout>
    </KeySetupGuard>
  );
}
