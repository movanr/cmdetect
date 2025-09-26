import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface LoadingStepProps {
  organizationName: string;
}

export function LoadingStep({ organizationName }: LoadingStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Checking Encryption Setup
        </CardTitle>
        <CardDescription>
          Verifying encryption configuration for {organizationName}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>Checking your encryption keys and determining the appropriate setup steps.</p>
        </div>
      </CardContent>
    </Card>
  );
}