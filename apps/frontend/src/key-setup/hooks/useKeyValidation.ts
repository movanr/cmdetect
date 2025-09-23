import { useState, useEffect } from "react";
import {
  hasStoredPrivateKey,
  loadPrivateKey,
  testKeyCompatibility,
} from "../../crypto";

interface UseKeyValidationProps {
  organizationPublicKey?: string;
  onValidationComplete?: (isValid: boolean) => void;
}

export interface KeyValidationResult {
  hasLocalKey: boolean;
  hasPublicKey: boolean;
  isCompatible: boolean | null;
  isLoading: boolean;
  error?: string;
}

export function useKeyValidation({
  organizationPublicKey,
  onValidationComplete,
}: UseKeyValidationProps) {
  const [result, setResult] = useState<KeyValidationResult>({
    hasLocalKey: false,
    hasPublicKey: false,
    isCompatible: null,
    isLoading: true,
  });

  const validateKeys = async () => {
    try {
      setResult((prev) => ({ ...prev, isLoading: true, error: undefined }));

      const hasLocalKey = await hasStoredPrivateKey();
      const hasPublicKey = !!organizationPublicKey;

      let isCompatible: boolean | null = null;

      // Only test compatibility if both keys exist
      if (hasLocalKey && hasPublicKey) {
        try {
          const privateKey = await loadPrivateKey();
          if (privateKey) {
            isCompatible = await testKeyCompatibility(
              privateKey,
              organizationPublicKey
            );
          }
        } catch (error) {
          console.error("Error testing key compatibility:", error);
          isCompatible = false;
        }
      }

      const newResult = {
        hasLocalKey,
        hasPublicKey,
        isCompatible,
        isLoading: false,
      };

      setResult(newResult);

      // Call callback with final validation result
      if (onValidationComplete) {
        const isValid = hasLocalKey && hasPublicKey && isCompatible === true;
        onValidationComplete(isValid);
      }
    } catch (error) {
      console.error("Error validating keys:", error);
      setResult({
        hasLocalKey: false,
        hasPublicKey: false,
        isCompatible: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      onValidationComplete?.(false);
    }
  };

  useEffect(() => {
    // Only validate if we have a defined value (either a key or explicitly null)
    // This prevents validation from running with undefined during initial load
    if (organizationPublicKey !== undefined) {
      validateKeys();
    }
  }, [organizationPublicKey]);

  return {
    ...result,
    revalidate: validateKeys,
  };
}
