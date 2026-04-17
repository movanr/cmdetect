import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getTranslations } from "@/config/i18n";

interface OrgLoadErrorStepProps {
  message: string;
  onRetry: () => Promise<unknown> | void;
}

export function OrgLoadErrorStep({ message, onRetry }: OrgLoadErrorStepProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const t = getTranslations();

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          {t.keySetup.orgLoadErrorTitle}
        </CardTitle>
        <CardDescription>{t.keySetup.orgLoadErrorDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
        <Button onClick={handleRetry} disabled={isRetrying} className="w-full">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
          />
          {t.keySetup.orgLoadErrorRetry}
        </Button>
      </CardContent>
    </Card>
  );
}
