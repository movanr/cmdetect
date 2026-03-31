import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Upload, FileText, AlertTriangle } from "lucide-react";
import { useKeyRecovery } from "../../hooks/useKeyRecovery";
import { getTranslations } from "@/config/i18n";

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
  const t = getTranslations();
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
          <AlertDescription>{t.keySetup.mismatchWarning}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t.keySetup.recoverFromMnemonicTitle}
          </h4>
          <div className="space-y-3">
            <textarea
              placeholder={t.keySetup.recoverFromMnemonicPlaceholder}
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
              {t.keySetup.recoverFromMnemonicButton}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t.keySetup.orDivider}
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t.keySetup.recoverFromFileTitle}
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
              {t.keySetup.recoverFromFileHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
