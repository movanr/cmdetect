import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, RefreshCw } from "lucide-react";
import { getTranslations } from "@/config/i18n";

/** Replaces {org} in a template string with a bold <strong> element */
function renderWithBoldOrg(template: string, orgName: string) {
  const parts = template.split("{org}");
  if (parts.length === 1) return template;
  return (
    <>
      {parts[0]}
      <strong className="font-semibold text-foreground">{orgName}</strong>
      {parts[1]}
    </>
  );
}

interface WaitingStepProps {
  organizationName: string;
  hasAdminRole?: boolean;
  onRefresh: () => void;
}

export function WaitingStep({ organizationName, hasAdminRole, onRefresh }: WaitingStepProps) {
  const t = getTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t.keySetup.waitingTitle}
        </CardTitle>
        <CardDescription>
          {renderWithBoldOrg(t.keySetup.waitingDescription, organizationName)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {hasAdminRole ? t.keySetup.waitingAlertSwitchRole : t.keySetup.waitingAlert}
        </p>
        <Button onClick={onRefresh} variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t.keySetup.checkAgainButton}
        </Button>
      </CardContent>
    </Card>
  );
}
