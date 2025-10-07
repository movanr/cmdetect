import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AdminSetupStepProps {
  organizationName: string;
  onStartGeneration: () => void;
}

export function AdminSetupStep({ organizationName, onStartGeneration }: AdminSetupStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Organization Encryption Setup
        </CardTitle>
        <CardDescription>
          Set up end-to-end encryption for {organizationName} to secure patient data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>
            This will generate cryptographic keys that enable secure, encrypted storage
            and transmission of sensitive patient information.
          </p>
        </div>
        <Button onClick={onStartGeneration}>
          <Shield className="h-4 w-4 mr-2" />
          Generate Organization Keys
        </Button>
      </CardContent>
    </Card>
  );
}