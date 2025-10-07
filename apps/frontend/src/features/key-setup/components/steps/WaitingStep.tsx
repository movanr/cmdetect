import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface WaitingStepProps {
  organizationName: string;
  onRefresh: () => void;
}

export function WaitingStep({ organizationName, onRefresh }: WaitingStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          Organization Setup Required
        </CardTitle>
        <CardDescription>
          Encryption has not been configured for {organizationName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your organization administrator needs to complete the initial encryption setup
            before you can access the application. Please contact your administrator to
            configure organization encryption keys.
          </AlertDescription>
        </Alert>
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>What your administrator needs to do:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Log in with admin privileges</li>
            <li>Complete the organization encryption setup</li>
            <li>Generate and secure the organization keys</li>
          </ul>
        </div>
        <Button onClick={onRefresh} variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Again
        </Button>
      </CardContent>
    </Card>
  );
}