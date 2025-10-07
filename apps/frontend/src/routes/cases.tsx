import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { CasesView } from "../features/cases/CasesView";
import { getTranslations } from "../config/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

          {/* Content - can be extended with tabs for "New" vs "Reviewed" */}
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="all">All Cases</TabsTrigger>
                <TabsTrigger value="new">New Submissions</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="mt-0">
              <CasesView />
            </TabsContent>
            <TabsContent value="new" className="mt-0">
              {/* TODO: Filter for only new/unviewed submissions */}
              <CasesView />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </KeySetupGuard>
  );
}
