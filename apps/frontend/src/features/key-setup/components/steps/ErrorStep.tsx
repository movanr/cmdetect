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

  const isOrphanedKeyError = error.includes("Orphaned private key");
  const isKeyMismatchError =
    error.includes("incompatible") || error.includes("mismatch");

  const handleDeleteKeys = async () => {
    setIsDeleting(true);
    try {
      await deleteStoredPrivateKey();
      toast.success("Private key deleted successfully");
      // Force revalidation after deletion instead of just resetting state
      if (onRevalidate) {
        onRevalidate();
      } else {
        onRetry();
      }
    } catch (err) {
      console.error("Failed to delete private key:", err);
      toast.error("Failed to delete private key");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Setup Error
        </CardTitle>
        <CardDescription>
          An error occurred during the encryption setup process.
        </CardDescription>
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
                    Deleting Keys...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Private Key
                  </>
                )}
              </Button>
              <Button
                onClick={onRevalidate || onRetry}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Revalidate
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
                  Start Key Recovery
                </Button>
              ) : (
                <Button onClick={onRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Setup
                </Button>
              )}
              {onRevalidate && (
                <Button
                  onClick={onRevalidate}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Keys Again
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Setup
              </Button>
              {onRevalidate && (
                <Button
                  onClick={onRevalidate}
                  variant="outline"
                  className="flex-1"
                >
                  Revalidate Keys
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
