/**
 * Shared configuration constants for CMDetect
 * Single source of truth for role definitions across all services
 */

export const roles = {
  ORG_ADMIN: "org_admin",
  PHYSICIAN: "physician",
  ASSISTANT: "assistant",
  RECEPTIONIST: "receptionist",
  UNVERIFIED: "unverified",
} as const;

export const roleHierarchy = [
  roles.PHYSICIAN,
  roles.ASSISTANT,
  roles.RECEPTIONIST,
  roles.ORG_ADMIN,
];

// ---------------------------------------------------------------------------
// Crypto contract types — shared between practitioner and patient frontends
// ---------------------------------------------------------------------------

/** ECIES encrypted payload. All binary fields are base64-encoded. */
export interface EncryptedPayload {
  ephemeralPublicKey: string;
  encryptedData: string;
  iv: string;
  version: string;
}

/** Patient personally identifiable information encrypted client-side. */
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

/** Hard-coded parameters for all cryptographic operations. */
export const CRYPTO_CONSTANTS = {
  ECDSA_CURVE: "P-256",
  ECDSA_PRIVATE_KEY_SIZE: 32,
  AES_KEY_SIZE: 256,
  AES_IV_SIZE: 12,
  SEED_PHRASE_LENGTH: 12,
  ENCRYPTION_VERSION: "1",
} as const;
