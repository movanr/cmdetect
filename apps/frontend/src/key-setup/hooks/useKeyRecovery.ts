import { useState } from "react";
import {
  recoverFromMnemonic,
  recoverFromFile,
} from "../utils/keyValidation.ts";
import type { KeyValidationOptions } from "../utils/keyValidation.ts";

interface UseKeyRecoveryProps {
  organizationPublicKey?: string;
  isAdmin: boolean;
  onSuccess?: () => void;
}

export function useKeyRecovery({
  organizationPublicKey,
  isAdmin,
  onSuccess,
}: UseKeyRecoveryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryMnemonic, setRecoveryMnemonic] = useState("");

  const validationOptions: KeyValidationOptions = {
    isAdmin,
    organizationPublicKey,
    onSuccess,
  };

  const handleRecoverFromMnemonic = async (): Promise<{
    privateKey: string;
    publicKey: string;
  } | null> => {
    setIsLoading(true);
    try {
      const result = await recoverFromMnemonic(
        recoveryMnemonic,
        validationOptions
      );
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverFromFile = async (
    file: File
  ): Promise<{ privateKey: string; publicKey: string } | null> => {
    setIsLoading(true);
    try {
      const result = await recoverFromFile(file, validationOptions);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const resetRecovery = () => {
    setRecoveryMnemonic("");
    setIsLoading(false);
  };

  return {
    // State
    isLoading,
    recoveryMnemonic,
    setRecoveryMnemonic,

    // Actions
    handleRecoverFromMnemonic,
    handleRecoverFromFile,
    resetRecovery,
  };
}
