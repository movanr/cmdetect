import { RefreshCw } from "lucide-react";
import { getTranslations } from "@/config/i18n";

export function LoadingStep() {
  const t = getTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t.keySetup.loading}</p>
    </div>
  );
}
