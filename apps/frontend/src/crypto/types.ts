// Crypto contract types — re-exported from shared config (SSOT)
export type { EncryptedPayload, PatientPII, CryptoError } from "@cmdetect/config";
export { CRYPTO_CONSTANTS } from "@cmdetect/config";

/** PEM-encoded ECDSA P-256 key pair. */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
  seedPhrase?: string;
}
