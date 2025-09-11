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


export interface CryptoError extends Error {
  code: string;
}

export const CRYPTO_CONSTANTS = {
  ECDSA_CURVE: "P-256",
  ECDSA_PRIVATE_KEY_SIZE: 32, // 256 bits for P-256
  AES_KEY_SIZE: 256,
  AES_IV_SIZE: 12, // 96 bits for GCM
  SEED_PHRASE_LENGTH: 12,
  ENCRYPTION_VERSION: "1", // ECIES version
} as const;
