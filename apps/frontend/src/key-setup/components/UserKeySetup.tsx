import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "../../lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationById } from "../queries";
import { execute } from "../../graphql/execute";
import { Key, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { deleteStoredPrivateKey } from "../../crypto";
import { KeyRecoveryForm } from "./KeyRecoveryForm";
import { useKeyValidation } from "../hooks/useKeyValidation";

interface UserKeySetupState {
  hasKeys: boolean;
  privateKey: string | null;
  setupStep:
    | "check"
    | "recover"
    | "complete"
    | "key-mismatch"
    | "wait-for-admin";
}

interface UserKeySetupProps {
  onSetupComplete?: () => void;
}

export function UserKeySetup({ onSetupComplete }: UserKeySetupProps) {
  const { data: session } = useSession();
  const [state, setState] = useState<UserKeySetupState>({
    hasKeys: false,
    privateKey: null,
    setupStep: "check",
  });

  // Get organization info from session
  const organizationId =
    (session?.user as any)?.organizationId || "org_unknown";

  // Fetch organization data to check for public key
  const { data: organizationData } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => execute(getOrganizationById, { id: organizationId }),
    enabled: !!organizationId && organizationId !== "org_unknown",
  });

  const organizationName =
    organizationData?.organization_by_pk?.name ||
    `Organization ${organizationId}`;

  const organizationPublicKey =
    organizationData?.organization_by_pk?.public_key_pem;

  // Use shared key validation hook - only run when org data is loaded
  const { revalidate } = useKeyValidation({
    organizationPublicKey: organizationPublicKey || undefined,
    onValidationComplete: (isValid) => {
      // Get fresh values from the validation result
      const hasPublicKey = !!organizationPublicKey;

      if (isValid) {
        setState((prev) => ({
          ...prev,
          hasKeys: true,
          setupStep: "complete",
          privateKey: "loaded",
        }));
        onSetupComplete?.();
      } else {
        // Determine what step to show based on the key state
        if (!hasPublicKey) {
          setState((prev) => ({ ...prev, setupStep: "wait-for-admin" }));
        } else {
          // Public key exists but local key is missing - show recovery
          setState((prev) => ({ ...prev, setupStep: "recover" }));
        }
      }
    },
  });

  const handleRecoverySuccess = async (keys: {
    privateKey: string;
    publicKey: string;
  }) => {
    setState((prev) => ({
      ...prev,
      privateKey: keys.privateKey,
      setupStep: "complete",
      hasKeys: true,
    }));

    onSetupComplete?.();
    revalidate(); // Revalidate keys after successful recovery
  };

  const handleDeleteAndRecover = async () => {
    try {
      await deleteStoredPrivateKey();
      setState((prev) => ({
        ...prev,
        hasKeys: false,
        privateKey: null,
        setupStep: "recover",
      }));
      revalidate(); // Trigger revalidation after key deletion
    } catch (error) {
      console.error("Failed to delete local key:", error);
    }
  };

  // Render different steps
  const renderContent = () => {
    switch (state.setupStep) {
      case "check":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Checking Encryption Setup
              </CardTitle>
              <CardDescription>
                Verifying your encryption configuration for {organizationName}
                ...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        );

      case "wait-for-admin":
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
                  Your organization administrator needs to complete the initial
                  encryption setup before you can access the application. Please
                  contact your administrator to configure organization
                  encryption keys.
                </AlertDescription>
              </Alert>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>What your administrator needs to do:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Log in with admin privileges</li>
                  <li>Complete the organization encryption setup</li>
                  <li>Generate and secure the organization keys</li>
                </ul>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </CardContent>
          </Card>
        );

      case "recover":
      case "key-mismatch":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Recover Your Private Key
              </CardTitle>
              <CardDescription>
                Restore your private encryption key for {organizationName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <KeyRecoveryForm
                organizationPublicKey={organizationPublicKey || undefined}
                isAdmin={false}
                onSuccess={handleRecoverySuccess}
                showMismatchWarning={state.setupStep === "key-mismatch"}
              />

              {state.setupStep === "key-mismatch" && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleDeleteAndRecover}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Delete Local Key and Recover Fresh
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "complete":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Encryption Setup Complete
              </CardTitle>
              <CardDescription>
                Your private key is properly configured for {organizationName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Private key restored and verified</p>
                <p>✓ Compatible with organization encryption</p>
                <p>✓ Patient data decryption enabled</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
}
