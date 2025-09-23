import { toast } from "sonner";
import {
  recoverKeysFromMnemonic,
  storePrivateKey,
  testKeyCompatibility,
} from "../../crypto";

export interface KeyValidationOptions {
  isAdmin: boolean;
  organizationPublicKey?: string;
  onSuccess?: () => void;
}

/**
 * Validates if a recovered private key is compatible with the organization's public key
 */
export async function validateRecoveredKey(
  recoveredPrivateKey: string,
  options: KeyValidationOptions
): Promise<boolean> {
  try {
    const { isAdmin, organizationPublicKey } = options;

    if (!organizationPublicKey) {
      if (isAdmin) {
        console.warn(
          "No organization public key found, validating recovered key independently"
        );
        return true; // Admin can accept the recovered key if no org key exists
      } else {
        toast.error(
          "Organization public key not found. Please contact your administrator."
        );
        return false;
      }
    }

    const isCompatible = await testKeyCompatibility(
      recoveredPrivateKey,
      organizationPublicKey
    );

    if (!isCompatible) {
      toast.error("Recovered key does not match the organization's public key");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating recovered key:", error);
    toast.error("Failed to validate recovered key");
    return false;
  }
}

/**
 * Recovers keys from a mnemonic phrase and validates them
 */
export async function recoverFromMnemonic(
  mnemonic: string,
  options: KeyValidationOptions
): Promise<{ privateKey: string; publicKey: string } | null> {
  if (!mnemonic.trim()) {
    toast.error("Please enter a mnemonic phrase");
    return null;
  }

  try {
    const recovered = await recoverKeysFromMnemonic(mnemonic.trim());

    const isValid = await validateRecoveredKey(recovered.privateKey, options);
    if (!isValid) {
      return null;
    }

    // Store the recovered private key locally
    await storePrivateKey(recovered.privateKey);

    toast.success("Keys recovered successfully from mnemonic!");
    options.onSuccess?.();

    return {
      privateKey: recovered.privateKey,
      publicKey: recovered.publicKey,
    };
  } catch (error) {
    console.error("Failed to recover from mnemonic:", error);
    toast.error(
      `Failed to recover keys: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return null;
  }
}

/**
 * Recovers keys from a recovery file and validates them
 */
export async function recoverFromFile(
  file: File,
  options: KeyValidationOptions
): Promise<{ privateKey: string; publicKey: string } | null> {
  try {
    // Read the file content
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });

    // Parse the recovery file
    const recoveryData = JSON.parse(fileContent);
    if (!recoveryData.mnemonic) {
      throw new Error("Invalid recovery file: missing mnemonic");
    }

    // Recover keys from the mnemonic in the file
    const recovered = await recoverKeysFromMnemonic(recoveryData.mnemonic);

    const isValid = await validateRecoveredKey(recovered.privateKey, options);
    if (!isValid) {
      return null;
    }

    // Store the recovered private key locally
    await storePrivateKey(recovered.privateKey);

    toast.success("Keys recovered successfully from file!");
    options.onSuccess?.();

    return {
      privateKey: recovered.privateKey,
      publicKey: recovered.publicKey,
    };
  } catch (error) {
    console.error("Failed to recover from file:", error);
    toast.error(
      `Failed to recover keys: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return null;
  }
}
