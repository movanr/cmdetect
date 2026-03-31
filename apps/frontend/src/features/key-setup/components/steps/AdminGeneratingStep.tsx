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
  Shield,
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
  const t = getTranslations();

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
      toast.success(t.keySetup.toastKeysGenerated);
    } catch (error) {
      console.error("Failed to generate keys:", error);
      toast.error(t.keySetup.toastKeysFailed);
      actions.setError(t.keySetup.toastKeysFailed);
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
      toast.success(t.keySetup.toastRecoveryDownloaded);
    } catch (error) {
      console.error("Failed to download recovery file:", error);
      toast.error(t.keySetup.toastRecoveryDownloadFailed);
    }
  };

  const handleCopyMnemonic = async () => {
    if (!state.keys) return;

    try {
      await navigator.clipboard.writeText(state.keys.mnemonic);
      toast.success(t.keySetup.toastMnemonicCopied);
    } catch {
      toast.error(t.keySetup.toastMnemonicCopyFailed);
    }
  };

  const storePublicKeyInDatabase = async (publicKeyPem: string) => {
    // SECURITY GUARD: Check if organization already has a public key
    if (context.organizationPublicKey) {
      const confirmed = window.confirm(t.keySetup.overwriteWarning);

      if (!confirmed) {
        throw new Error("Operation cancelled by user");
      }

      const destructionConfirm = window.prompt(t.keySetup.overwriteConfirmPrompt);

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
      toast.success(t.keySetup.toastSetupComplete);
      onComplete?.();
    } catch (error) {
      console.error("Failed to complete setup:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`${t.keySetup.toastSetupFailed}: ${message}`);
      actions.setError(`${t.keySetup.toastSetupFailed}: ${message}`);
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
              <Shield className="h-5 w-5" />
              {t.keySetup.adminTitle}
            </CardTitle>
            <CardDescription>
              {renderWithBoldOrg(t.keySetup.adminDescription, context.organizationName)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateKeys} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t.keySetup.generatingButton}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {t.keySetup.generateButton}
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
              {t.keySetup.downloadTitle}
            </CardTitle>
            <CardDescription>{t.keySetup.downloadDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t.keySetup.downloadWarning}</AlertDescription>
            </Alert>
            <Button
              onClick={handleDownloadRecoveryFile}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {t.keySetup.downloadButton}
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
              {t.keySetup.mnemonicTitle}
            </CardTitle>
            <CardDescription>
              {t.keySetup.mnemonicDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t.keySetup.mnemonicWarning}</AlertDescription>
            </Alert>
            {!showMnemonic ? (
              <Button
                onClick={() => setShowMnemonic(true)}
                variant="outline"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t.keySetup.revealButton}
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
                  {t.keySetup.copyButton}
                </Button>
              </div>
            )}
            {showMnemonic && (
              <Button
                onClick={handleCompleteSetup}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t.keySetup.completingSetupButton}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t.keySetup.completeSetupButton}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
