import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

interface CompletedStepProps {
  organizationName: string;
  onContinue?: () => void;
}

export function CompletedStep({ organizationName, onContinue }: CompletedStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Encryption Setup Complete
        </CardTitle>
        <CardDescription>
          Organization encryption is properly configured for {organizationName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Organization keys generated and secured</p>
          <p>✓ End-to-end encryption enabled</p>
          <p>✓ Patient data will be encrypted automatically</p>
        </div>
        {onContinue && (
          <Button onClick={onContinue} className="w-full">
            <ArrowRight className="h-4 w-4 mr-2" />
            Continue to Application
          </Button>
        )}
      </CardContent>
    </Card>
  );
}