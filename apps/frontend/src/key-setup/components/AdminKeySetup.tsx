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
import { useQuery, useMutation } from "@tanstack/react-query";
import { getOrganizationById, updateOrganizationPublicKey } from "../queries";
import { execute } from "../../graphql/execute";
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
  deleteStoredPrivateKey,
  generateKeyFingerprint,
  loadPrivateKey,
} from "../../crypto";
import { useKeyValidation } from "../hooks/useKeyValidation";
import { KeyRecoveryForm } from "./KeyRecoveryForm";

interface AdminKeySetupState {
  hasKeys: boolean;
  mnemonic: string | null;
  publicKey: string | null;
  privateKey: string | null;
  setupStep:
    | "check"
    | "generate"
    | "download"
    | "mnemonic"
    | "complete"
    | "recover"
    | "file-recover"
    | "key-mismatch"
    | "local-key-warning";
}

interface AdminKeySetupProps {
  onSetupComplete?: () => void;
}

export function AdminKeySetup({ onSetupComplete }: AdminKeySetupProps) {
  const { data: session } = useSession();
  const [state, setState] = useState<AdminKeySetupState>({
    hasKeys: false,
    mnemonic: null,
    publicKey: null,
    privateKey: null,
    setupStep: "check",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasViewedMnemonic, setHasViewedMnemonic] = useState(false);

  // Get organization info from session
  const organizationId =
    (session?.user as any)?.organizationId || "org_unknown";

  // Fetch organization name using GraphQL
  const { data: organizationData } = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => execute(getOrganizationById, { id: organizationId }),
    enabled: !!organizationId && organizationId !== "org_unknown",
  });

  // Mutation to update organization public key
  const updateOrgPublicKeyMutation = useMutation({
    mutationFn: (variables: {
      id: string;
      public_key_pem: string;
      key_fingerprint: string;
      key_created_at: string;
    }) => execute(updateOrganizationPublicKey, variables),
  });

  const organizationName =
    organizationData?.organization_by_pk?.name ||
    `Organization ${organizationId}`;

  const organizationPublicKey =
    organizationData?.organization_by_pk?.public_key_pem;

  // Use shared key validation hook
  const { revalidate } = useKeyValidation({
    organizationPublicKey: organizationPublicKey || undefined,
    onValidationComplete: (isValid) => {
      // Get fresh values from the current context
      const hasLocalKey = false; // We know this from the validation
      const hasPublicKey = !!organizationPublicKey;

      if (isValid) {
        setState((prev) => ({ ...prev, hasKeys: true, setupStep: "complete" }));
        onSetupComplete?.();
      } else {
        // Determine what step to show based on the key state
        if (!hasLocalKey && !hasPublicKey) {
          // No keys at all - admin needs to generate organization keys
          setState((prev) => ({ ...prev, setupStep: "generate" }));
        } else if (!hasLocalKey && hasPublicKey) {
          // Organization keys exist but no local key - admin needs to recover
          setState((prev) => ({ ...prev, setupStep: "recover" }));
        }
      }
    },
  });

  const storePublicKeyInDatabase = async (publicKeyPem: string) => {
    // SECURITY GUARD: Check if organization already has a public key
    if (organizationPublicKey) {
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
        id: organizationId,
        public_key_pem: publicKeyPem,
        key_fingerprint: keyFingerprint,
        key_created_at: keyCreatedAt,
      });
    } catch (error) {
      console.error("Failed to store public key in database:", error);
      throw new Error(
        `Failed to store public key in database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleGenerateKeys = async () => {
    setIsLoading(true);
    try {
      const keys = await generateOrganizationKeys();
      setState((prev) => ({
        ...prev,
        mnemonic: keys.englishMnemonic,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        setupStep: "download",
      }));
      toast.success("Organization keys generated successfully");
    } catch (error) {
      console.error("Failed to generate keys:", error);
      toast.error("Failed to generate keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadRecoveryFile = async () => {
    if (!state.privateKey || !state.publicKey || !state.mnemonic) {
      toast.error("Keys not available for download");
      return;
    }

    try {
      await createAndDownloadRecoveryFile(state.mnemonic, {
        organizationId,
        organizationName,
      });
      setHasDownloaded(true);
      toast.success("Recovery file downloaded successfully");
    } catch (error) {
      console.error("Failed to download recovery file:", error);
      toast.error("Failed to download recovery file");
    }
  };

  const handleCopyMnemonic = async () => {
    if (!state.mnemonic) return;

    try {
      await navigator.clipboard.writeText(state.mnemonic);
      toast.success("Mnemonic copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy mnemonic");
    }
  };

  const handleViewMnemonic = () => {
    setShowMnemonic(true);
    setHasViewedMnemonic(true);
  };

  const handleCompleteSetup = async () => {
    if (!state.privateKey || !state.publicKey) {
      toast.error("Keys not available");
      return;
    }

    setIsLoading(true);
    try {
      // Store the private key locally
      await storePrivateKey(state.privateKey);

      // Store the public key in the database
      await storePublicKeyInDatabase(state.publicKey);

      setState((prev) => ({ ...prev, setupStep: "complete", hasKeys: true }));
      toast.success("Organization encryption setup completed!");
      onSetupComplete?.();
    } catch (error) {
      console.error("Failed to complete setup:", error);
      toast.error(
        `Failed to complete setup: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySuccess = async (keys: {
    privateKey: string;
    publicKey: string;
  }) => {
    // If no organization public key exists, store the recovered one
    if (!organizationData?.organization_by_pk?.public_key_pem) {
      await storePublicKeyInDatabase(keys.publicKey);
    }

    setState((prev) => ({
      ...prev,
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
      setupStep: "complete",
      hasKeys: true,
    }));

    onSetupComplete?.();
    revalidate(); // Revalidate keys after successful recovery
  };

  const handleDeleteAndRestart = async () => {
    try {
      await deleteStoredPrivateKey();
      setState({
        hasKeys: false,
        mnemonic: null,
        publicKey: null,
        privateKey: null,
        setupStep: "check",
      });
      setShowMnemonic(false);
      setHasDownloaded(false);
      setHasViewedMnemonic(false);
      toast.success("Local keys deleted. Starting fresh setup.");
    } catch (error) {
      console.error("Failed to delete local keys:", error);
      toast.error("Failed to delete local keys");
    }
  };

  // Render different steps
  const renderContent = () => {
    switch (state.setupStep) {
      case "check":
        // Safe checking state - shows loading while determining what to do
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
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Checking your encryption keys and determining the appropriate
                  setup steps.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "generate":
        // Generate new organization keys (only when no keys exist)
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Organization Encryption Setup
              </CardTitle>
              <CardDescription>
                Set up end-to-end encryption for {organizationName} to secure
                patient data.
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
              <Button onClick={handleGenerateKeys} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Generate Organization Keys
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
                  You must download your recovery file before proceeding. This
                  is the only way to recover your keys if you lose access to
                  this device.
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
                onClick={() =>
                  setState((prev) => ({ ...prev, setupStep: "mnemonic" }))
                }
                disabled={!hasDownloaded}
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
                  This mnemonic phrase can be used to recover your keys. Store
                  it in a secure location separate from your recovery file.
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
                    {state.mnemonic}
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
                onClick={handleCompleteSetup}
                disabled={!hasViewedMnemonic || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Setup
              </Button>
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
                Organization encryption is properly configured for{" "}
                {organizationName}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Organization keys generated and secured</p>
                <p>✓ End-to-end encryption enabled</p>
                <p>✓ Patient data will be encrypted automatically</p>
              </div>
            </CardContent>
          </Card>
        );

      case "key-mismatch":
      case "recover":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Recover Organization Keys
              </CardTitle>
              <CardDescription>
                Restore your encryption keys using your recovery method.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyRecoveryForm
                organizationPublicKey={organizationPublicKey || undefined}
                isAdmin={true}
                onSuccess={handleRecoverySuccess}
                showMismatchWarning={state.setupStep === "key-mismatch"}
              />
            </CardContent>
          </Card>
        );

      case "local-key-warning":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Local Key Found
              </CardTitle>
              <CardDescription>
                A private key exists locally but no organization key is
                configured.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have a local private key but the organization doesn't have
                  a public key configured. You can either set up the
                  organization with your existing key or start fresh.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button
                  onClick={async () => {
                    try {
                      const privateKey = await loadPrivateKey();
                      if (privateKey) {
                        // Re-derive public key from private key and set up organization
                        const keys = await generateOrganizationKeys();
                        await storePublicKeyInDatabase(keys.publicKey);
                        setState((prev) => ({
                          ...prev,
                          setupStep: "complete",
                          hasKeys: true,
                        }));
                        onSetupComplete?.();
                      }
                    } catch (error) {
                      toast.error(
                        "Failed to configure organization with existing key"
                      );
                    }
                  }}
                  className="w-full"
                >
                  Use Existing Key for Organization
                </Button>
                <Button
                  onClick={handleDeleteAndRestart}
                  variant="outline"
                  className="w-full"
                >
                  Delete Local Key and Start Fresh
                </Button>
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
