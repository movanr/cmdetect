/** ECIES encrypted payload. All binary fields are base64-encoded. */
export interface EncryptedPayload {
  ephemeralPublicKey: string; // ECIES ephemeral public key (base64)
  encryptedData: string; // AES-GCM encrypted patient data (base64)
  iv: string; // AES initialization vector (base64)
  version: string; // Encryption version for compatibility
}

/** PEM-encoded ECDSA P-256 key pair. */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
  seedPhrase?: string;
}

/**
 * Patient personally identifiable information encrypted client-side.
 * Validated at decryption time — `dateOfBirth` must be ISO format (YYYY-MM-DD).
 */
export interface PatientPII {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  [key: string]: unknown;
}

/** Structured error thrown by crypto operations, with a machine-readable `code`. */
export interface CryptoError extends Error {
  code: string;
}

/** Hard-coded parameters for all cryptographic operations in this module. */
export const CRYPTO_CONSTANTS = {
  ECDSA_CURVE: "P-256",
  ECDSA_PRIVATE_KEY_SIZE: 32, // 256 bits for P-256
  AES_KEY_SIZE: 256,
  AES_IV_SIZE: 12, // 96 bits for GCM
  SEED_PHRASE_LENGTH: 12,
  ENCRYPTION_VERSION: "1", // ECIES version
} as const;
