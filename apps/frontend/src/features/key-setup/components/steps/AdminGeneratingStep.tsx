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
import {
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateOrganizationKeys,
  createAndDownloadRecoveryFile,
  storePrivateKey,
  generateKeyFingerprint,
} from "@/crypto";
import type { KeySetupState, GeneratedKeys } from "../../types/keySetup";
import { useMutation } from "@tanstack/react-query";
import { updateOrganizationPublicKey } from "../../queries";
import { execute } from "@/graphql/execute";

interface AdminGeneratingStepProps {
  state: Extract<KeySetupState, { type: "admin-generating" }>;
  context: {
    organizationId: string;
    organizationName: string;
    organizationPublicKey?: string | null;
  };
  actions: {
    setKeysGenerated: (keys: GeneratedKeys) => void;
    setRecoveryFileDownloaded: () => void;
    setMnemonicViewed: () => void;
    setSetupComplete: () => void;
    setError: (error: string) => void;
  };
  onComplete?: () => void;
}

export function AdminGeneratingStep({
  state,
  context,
  actions,
  onComplete,
}: AdminGeneratingStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Mutation to update organization public key
  const updateOrgPublicKeyMutation = useMutation({
    mutationFn: (variables: {
      id: string;
      public_key_pem: string;
      key_fingerprint: string;
      key_created_at: string;
    }) => execute(updateOrganizationPublicKey, variables),
  });

  const handleGenerateKeys = async () => {
    setIsProcessing(true);
    try {
      const keys = await generateOrganizationKeys();
      actions.setKeysGenerated({
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        mnemonic: keys.englishMnemonic,
      });
      toast.success("Organization keys generated successfully");
    } catch (error) {
      console.error("Failed to generate keys:", error);
      toast.error("Failed to generate keys");
      actions.setError("Failed to generate keys");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadRecoveryFile = async () => {
    if (!state.keys) return;

    try {
      createAndDownloadRecoveryFile(state.keys.mnemonic, {
        organizationId: context.organizationId,
        organizationName: context.organizationName,
      });
      actions.setRecoveryFileDownloaded();
      toast.success("Recovery file downloaded successfully");
    } catch (error) {
      console.error("Failed to download recovery file:", error);
      toast.error("Failed to download recovery file");
    }
  };

  const handleViewMnemonic = () => {
    setShowMnemonic(true);
    // Don't call actions.setMnemonicViewed() here - wait for user to continue
  };

  const handleCopyMnemonic = async () => {
    if (!state.keys) return;

    try {
      await navigator.clipboard.writeText(state.keys.mnemonic);
      toast.success("Mnemonic copied to clipboard");
    } catch {
      toast.error("Failed to copy mnemonic");
    }
  };

  const storePublicKeyInDatabase = async (publicKeyPem: string) => {
    // SECURITY GUARD: Check if organization already has a public key
    if (context.organizationPublicKey) {
      const confirmed = window.confirm(
        `⚠️ DANGER: This organization already has encryption keys set up!\n\n` +
          `Overwriting existing keys will:\n` +
          `• Break key recovery for users on new devices\n` +
          `• Create encryption inconsistencies for new data\n` +
          `• Require ALL users to set up new keys\n` +
          `• Potentially cause data synchronization issues\n\n` +
          `Are you absolutely sure you want to REPLACE the existing keys?\n\n` +
          `Type "REPLACE" in the next prompt to confirm.`
      );

      if (!confirmed) {
        throw new Error("Operation cancelled by user");
      }

      const destructionConfirm = window.prompt(
        `⚠️ FINAL WARNING: Type "REPLACE" to confirm you want to replace existing encryption keys:`
      );

      if (destructionConfirm !== "REPLACE") {
        throw new Error("Destruction not confirmed - operation cancelled");
      }
    }

    try {
      const keyFingerprint = generateKeyFingerprint(publicKeyPem);
      const keyCreatedAt = new Date().toISOString();

      await updateOrgPublicKeyMutation.mutateAsync({
        id: context.organizationId,
        public_key_pem: publicKeyPem,
        key_fingerprint: keyFingerprint,
        key_created_at: keyCreatedAt,
      });
    } catch (error) {
      console.error("Failed to store public key in database:", error);
      throw new Error(
        `Failed to store public key in database: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleCompleteSetup = async () => {
    if (!state.keys) return;

    setIsProcessing(true);
    try {
      // Store the private key locally
      await storePrivateKey(state.keys.privateKey);

      // Store the public key in the database
      await storePublicKeyInDatabase(state.keys.publicKey);

      actions.setSetupComplete();
      toast.success("Organization encryption setup completed!");
      onComplete?.();
    } catch (error) {
      console.error("Failed to complete setup:", error);
      toast.error(
        `Failed to complete setup: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      actions.setError(
        `Failed to complete setup: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  switch (state.step) {
    case "generate":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Generate Organization Keys
            </CardTitle>
            <CardDescription>
              Create the encryption keys for {context.organizationName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                This will generate cryptographic keys that enable secure,
                encrypted storage and transmission of sensitive patient
                information.
              </p>
            </div>
            <Button onClick={handleGenerateKeys} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Keys...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Keys
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      );

    case "download":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Recovery File
            </CardTitle>
            <CardDescription>
              Save your encryption keys securely before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must download your recovery file before proceeding. This is
                the only way to recover your keys if you lose access to this
                device.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleDownloadRecoveryFile}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Recovery File
            </Button>
            <Button
              onClick={() => actions.setRecoveryFileDownloaded()}
              disabled={!state.hasDownloaded}
              className="w-full"
            >
              Continue to Mnemonic Backup
            </Button>
          </CardContent>
        </Card>
      );

    case "mnemonic":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Backup Mnemonic Phrase
            </CardTitle>
            <CardDescription>
              Write down this 12-word phrase and store it securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This mnemonic phrase can be used to recover your keys. Store it
                in a secure location separate from your recovery file.
              </AlertDescription>
            </Alert>
            {!showMnemonic ? (
              <Button
                onClick={handleViewMnemonic}
                variant="outline"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Reveal Mnemonic Phrase
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  {state.keys?.mnemonic}
                </div>
                <Button
                  onClick={handleCopyMnemonic}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>
            )}
            <Button
              onClick={() => actions.setMnemonicViewed()}
              disabled={!showMnemonic}
              className="w-full"
            >
              Continue to Finalize Setup
            </Button>
          </CardContent>
        </Card>
      );

    case "finalizing":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Complete Setup
            </CardTitle>
            <CardDescription>
              Finalize the encryption setup for {context.organizationName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                Click below to store your keys and complete the encryption
                setup.
              </p>
            </div>
            <Button
              onClick={handleCompleteSetup}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Completing Setup...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
