import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteStoredPrivateKey } from "@/crypto";
import { toast } from "sonner";
import { getTranslations } from "@/config/i18n";

interface ErrorStepProps {
  error: string;
  onRetry: () => void;
  onRevalidate?: () => void;
  onStartRecovery?: () => void;
}

export function ErrorStep({
  error,
  onRetry,
  onRevalidate,
  onStartRecovery,
}: ErrorStepProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const t = getTranslations();

  const isOrphanedKeyError = error.includes("Orphaned private key");
  const isKeyMismatchError =
    error.includes("incompatible") || error.includes("mismatch");

  const handleDeleteKeys = async () => {
    setIsDeleting(true);
    try {
      await deleteStoredPrivateKey();
      toast.success(t.keySetup.toastKeyDeleted);
      // Force revalidation after deletion instead of just resetting state
      if (onRevalidate) {
        onRevalidate();
      } else {
        onRetry();
      }
    } catch (err) {
      console.error("Failed to delete private key:", err);
      toast.error(t.keySetup.toastKeyDeleteFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          {t.keySetup.errorTitle}
        </CardTitle>
        <CardDescription>{t.keySetup.errorDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          {isOrphanedKeyError ? (
            <>
              <Button
                onClick={handleDeleteKeys}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t.keySetup.deletingKeyButton}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.keySetup.deleteKeyButton}
                  </>
                )}
              </Button>
              <Button
                onClick={onRevalidate || onRetry}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.keySetup.revalidateButton}
              </Button>
            </>
          ) : isKeyMismatchError ? (
            <>
              {onStartRecovery ? (
                <Button
                  onClick={onStartRecovery}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.keySetup.startRecoveryButton}
                </Button>
              ) : (
                <Button onClick={onRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.keySetup.retryButton}
                </Button>
              )}
              {onRevalidate && (
                <Button
                  onClick={onRevalidate}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.keySetup.checkKeysButton}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t.keySetup.retryButton}
              </Button>
              {onRevalidate && (
                <Button
                  onClick={onRevalidate}
                  variant="outline"
                  className="flex-1"
                >
                  {t.keySetup.revalidateButton}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
