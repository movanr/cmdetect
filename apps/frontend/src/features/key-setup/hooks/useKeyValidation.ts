import { useState, useEffect, useCallback, useRef } from "react";
import {
  hasStoredPrivateKey,
  loadPrivateKey,
  testKeyCompatibility,
} from "../../../crypto";

interface UseKeyValidationProps {
  organizationPublicKey?: string | null;
  onValidationComplete?: (
    isValid: boolean,
    validationData?: {
      hasLocalKey: boolean;
      hasPublicKey: boolean;
      isCompatible: boolean | null;
    }
  ) => void;
}

export function useKeyValidation({
  organizationPublicKey,
  onValidationComplete,
}: UseKeyValidationProps) {
  const [hasLocalKey, setHasLocalKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Use ref to avoid infinite re-renders from callback changes
  const callbackRef = useRef(onValidationComplete);
  callbackRef.current = onValidationComplete;

  const validateKeys = useCallback(async () => {
    if (organizationPublicKey === undefined) return; // Wait for org data

    try {
      setIsLoading(true);
      setError(undefined);

      const hasLocal = await hasStoredPrivateKey();
      setHasLocalKey(hasLocal);

      const hasPublicKey = !!organizationPublicKey;
      let isCompatible: boolean | null = null;

      if (hasLocal && hasPublicKey) {
        try {
          const privateKey = await loadPrivateKey();
          if (privateKey) {
            isCompatible = await testKeyCompatibility(
              privateKey,
              organizationPublicKey
            );
          }
        } catch (compatError) {
          console.error("Compatibility test failed:", compatError);
          isCompatible = false;
        }
      }

      const isValid = hasLocal && hasPublicKey && isCompatible === true;

      callbackRef.current?.(isValid, {
        hasLocalKey: hasLocal,
        hasPublicKey,
        isCompatible,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Validation failed";
      setError(errorMessage);
      callbackRef.current?.(false, {
        hasLocalKey: false,
        hasPublicKey: false,
        isCompatible: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [organizationPublicKey]);

  useEffect(() => {
    validateKeys();
  }, [validateKeys]);

  return {
    hasLocalKey,
    isLoading,
    error,
    revalidate: validateKeys,
  };
}
