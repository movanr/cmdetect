export interface EncryptedPayload {
  ephemeralPublicKey: string; // ECIES ephemeral public key (base64)
  encryptedData: string; // AES-GCM encrypted patient data (base64)
  iv: string; // AES initialization vector (base64)
  version: string; // Encryption version for compatibility
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  seedPhrase?: string;
}

export interface PatientPII {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  [key: string]: any;
}

export interface StoredKey {
  encryptedKey: string;
  iv: string;
  salt: string;
}

export interface CryptoError extends Error {
  code: string;
}

export const CRYPTO_CONSTANTS = {
  ECDSA_CURVE: "P-256",
  ECDSA_PRIVATE_KEY_SIZE: 32, // 256 bits for P-256
  AES_KEY_SIZE: 256,
  AES_IV_SIZE: 12, // 96 bits for GCM
  PBKDF2_ITERATIONS: 100000,
  SEED_PHRASE_LENGTH: 12,
  ENCRYPTION_VERSION: "1", // ECIES version
  KEY_DERIVATION_SALT_SIZE: 16,
} as const;

export const CRYPTO_ALGORITHMS = {
  AES: {
    name: "AES-GCM",
    length: 256,
  },
  PBKDF2: {
    name: "PBKDF2",
    hash: "SHA-256",
  },
} as const;
