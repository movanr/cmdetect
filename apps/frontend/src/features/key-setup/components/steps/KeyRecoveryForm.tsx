import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Upload, FileText, AlertTriangle } from "lucide-react";
import { useKeyRecovery } from "../../hooks/useKeyRecovery";

interface KeyRecoveryFormProps {
  organizationPublicKey?: string;
  isAdmin: boolean;
  onSuccess?: (keys: { privateKey: string; publicKey: string }) => void;
  showMismatchWarning?: boolean;
  className?: string;
}

export function KeyRecoveryForm({
  organizationPublicKey,
  isAdmin,
  onSuccess,
  showMismatchWarning = false,
  className = "",
}: KeyRecoveryFormProps) {
  const {
    isLoading,
    recoveryMnemonic,
    setRecoveryMnemonic,
    handleRecoverFromMnemonic,
    handleRecoverFromFile,
  } = useKeyRecovery({
    organizationPublicKey,
    isAdmin,
    onSuccess: () => {
      // This will be called by the utility functions after successful recovery
    },
  });

  const onMnemonicRecover = async () => {
    const result = await handleRecoverFromMnemonic();
    if (result) {
      onSuccess?.(result);
    }
  };

  const onFileRecover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await handleRecoverFromFile(file);
    if (result) {
      onSuccess?.(result);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {showMismatchWarning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your local private key doesn't match the organization's public key.
            Please recover the correct private key.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Recover from Mnemonic Phrase
          </h4>
          <div className="space-y-3">
            <textarea
              placeholder="Enter your 12-word mnemonic phrase"
              value={recoveryMnemonic}
              onChange={(e) => setRecoveryMnemonic(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md resize-none"
              rows={3}
            />
            <Button
              onClick={onMnemonicRecover}
              disabled={!recoveryMnemonic.trim() || isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Recover from Mnemonic
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Recover from Recovery File
          </h4>
          <div className="space-y-3">
            <input
              type="file"
              accept=".json"
              onChange={onFileRecover}
              className="w-full px-3 py-2 border border-input rounded-md file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-muted file:text-muted-foreground hover:file:bg-muted-foreground/20"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Select the JSON recovery file downloaded during initial setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
