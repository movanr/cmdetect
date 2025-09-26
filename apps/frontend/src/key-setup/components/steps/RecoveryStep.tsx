import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key } from "lucide-react";
import { KeyRecoveryForm } from "./KeyRecoveryForm";

interface RecoveryStepProps {
  organizationPublicKey?: string;
  isAdmin: boolean;
  onSuccess: (keys: { privateKey: string; publicKey: string }) => void;
}

export function RecoveryStep({
  organizationPublicKey,
  isAdmin,
  onSuccess,
}: RecoveryStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Recover Your Private Key
        </CardTitle>
        <CardDescription>
          Restore your private encryption key to access the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <KeyRecoveryForm
          organizationPublicKey={organizationPublicKey}
          isAdmin={isAdmin}
          onSuccess={onSuccess}
          showMismatchWarning={false}
        />
      </CardContent>
    </Card>
  );
}
