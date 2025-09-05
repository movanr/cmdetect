export interface EncryptedPayload {
  encryptedAESKey: string;
  encryptedData: string;
  iv: string;
  version: string;
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

export interface CryptoKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface SeedPhraseResult {
  seedPhrase: string;
  keyPair: CryptoKeyPair;
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
  RSA_KEY_SIZE: 2048,
  AES_KEY_SIZE: 256,
  AES_IV_SIZE: 12, // 96 bits for GCM
  PBKDF2_ITERATIONS: 100000,
  SEED_PHRASE_LENGTH: 12,
  ENCRYPTION_VERSION: '1',
  KEY_DERIVATION_SALT_SIZE: 16,
} as const;

export const CRYPTO_ALGORITHMS = {
  RSA: {
    name: 'RSA-OAEP',
    hash: 'SHA-256',
  },
  AES: {
    name: 'AES-GCM',
    length: 256,
  },
  PBKDF2: {
    name: 'PBKDF2',
    hash: 'SHA-256',
  },
} as const;