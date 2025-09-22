import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import type { CryptoError } from "./types";

export interface RecoveryFileData {
  version: string;
  organizationId: string;
  organizationName: string;
  createdAt: string;
  mnemonic: string;
}

export interface RecoveryFileOptions {
  organizationId: string;
  organizationName: string;
}

const RECOVERY_FILE_VERSION = "1.0.0";

/**
 * Generates a recovery file containing mnemonic and organization metadata
 */
export function generateRecoveryFile(
  mnemonic: string,
  options: RecoveryFileOptions
): RecoveryFileData {
  try {
    if (!validateMnemonic(mnemonic, wordlist)) {
      throw new Error("Invalid mnemonic phrase");
    }

    return {
      version: RECOVERY_FILE_VERSION,
      organizationId: options.organizationId,
      organizationName: options.organizationName,
      createdAt: new Date().toISOString(),
      mnemonic: mnemonic,
    };
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "RecoveryFileError",
      message: `Failed to generate recovery file: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "RECOVERY_FILE_GENERATION_FAILED",
    };
    throw cryptoError;
  }
}

/**
 * Downloads a recovery file to the user's device
 */
export function downloadRecoveryFile(
  recoveryData: RecoveryFileData,
  filename?: string
): void {
  try {
    const jsonData = JSON.stringify(recoveryData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `cmdetect-recovery-${recoveryData.organizationName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "RecoveryFileError",
      message: `Failed to download recovery file: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "RECOVERY_FILE_DOWNLOAD_FAILED",
    };
    throw cryptoError;
  }
}

/**
 * Parses and validates a recovery file
 */
export function parseRecoveryFile(fileContent: string): RecoveryFileData {
  try {
    const recoveryData: RecoveryFileData = JSON.parse(fileContent);

    const requiredFields: (keyof RecoveryFileData)[] = [
      "version",
      "organizationId",
      "organizationName",
      "createdAt",
      "mnemonic"
    ];

    for (const field of requiredFields) {
      if (!recoveryData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (recoveryData.version !== RECOVERY_FILE_VERSION) {
      throw new Error(`Unsupported recovery file version: ${recoveryData.version}`);
    }

    if (!validateMnemonic(recoveryData.mnemonic, wordlist)) {
      throw new Error("Invalid mnemonic in recovery file");
    }

    return recoveryData;
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "RecoveryFileError",
      message: `Failed to parse recovery file: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "RECOVERY_FILE_PARSE_FAILED",
    };
    throw cryptoError;
  }
}

/**
 * Creates a recovery file and triggers download
 */
export function createAndDownloadRecoveryFile(
  mnemonic: string,
  options: RecoveryFileOptions,
  filename?: string
): void {
  const recoveryData = generateRecoveryFile(mnemonic, options);
  downloadRecoveryFile(recoveryData, filename);
}

/**
 * Handles file upload and returns the recovery data
 */
export function uploadRecoveryFile(): Promise<RecoveryFileData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          reject(new Error("Failed to read file"));
          return;
        }

        try {
          const recoveryData = parseRecoveryFile(content);
          resolve(recoveryData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    };

    input.click();
  });
}