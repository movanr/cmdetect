import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "../../components/layouts/AppLayout";
import ExaminationPlaygroundPage from "../../features/examination/playground/page";
import { KeySetupGuard } from "../../features/key-setup/components/KeySetupGuard";

export const Route = createFileRoute("/examination/playground")({
  component: ExaminationPlayground,
});

function ExaminationPlayground() {
  return (
    <KeySetupGuard>
      <AppLayout>
        <ExaminationPlaygroundPage />
      </AppLayout>
    </KeySetupGuard>
  );
}
