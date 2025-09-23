import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Shield } from "lucide-react";

interface WaitForAdminMessageProps {
  organizationName: string;
  onRefresh?: () => void;
}

export function WaitForAdminMessage({
  organizationName,
  onRefresh
}: WaitForAdminMessageProps) {
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
            Your organization administrator needs to complete the initial encryption
            setup before you can access the application. Please contact your
            administrator to configure organization encryption keys.
          </AlertDescription>
        </Alert>

        <div className="text-sm text-muted-foreground space-y-3">
          <div>
            <p className="font-medium mb-2">What your administrator needs to do:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Log in with organization admin privileges</li>
              <li>Complete the organization encryption setup wizard</li>
              <li>Generate and securely store the organization keys</li>
              <li>Download the recovery file and backup mnemonic phrase</li>
            </ul>
          </div>

          <div>
            <p className="font-medium mb-2">Why this is required:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>End-to-end encryption protects patient data</li>
              <li>Organization keys enable secure data access</li>
              <li>Compliance with healthcare data protection standards</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Encryption setup pending</span>
          </div>

          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}