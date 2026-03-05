import {
  generateMnemonic,
  mnemonicToSeed,
  validateMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { p256 } from "@noble/curves/nist";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { CRYPTO_CONSTANTS } from "./types";

/**
 * Generates a new organization key pair with a BIP39 12-word mnemonic.
 *
 * The mnemonic deterministically derives an ECDSA P-256 key pair via
 * BIP39 seed → HKDF. The same mnemonic always produces the same keys,
 * enabling recovery without storing the private key server-side.
 *
 * @returns PEM-encoded public/private keys and the English mnemonic
 */
export async function generateOrganizationKeys(): Promise<{
  publicKey: string;
  privateKey: string;
  englishMnemonic: string;
}> {
  const englishMnemonic = generateMnemonic(wordlist, 128);

  const keyPair = await generateKeyPairFromMnemonic(englishMnemonic);

  return {
    publicKey: keyPair.publicKeyPem,
    privateKey: keyPair.privateKeyPem,
    englishMnemonic,
  };
}

/**
 * Verifies that a mnemonic produces the same keys on repeated derivation.
 *
 * @throws {Error} If the mnemonic is invalid
 */
export async function verifyDeterministicKeys(
  mnemonic: string
): Promise<boolean> {
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error("Invalid mnemonic phrase");
  }

  const keyPair1 = await generateKeyPairFromMnemonic(mnemonic);
  const keyPair2 = await generateKeyPairFromMnemonic(mnemonic);

  return keyPair1.publicKeyPem === keyPair2.publicKeyPem; // Same mnemonic should produce identical keys
}

/**
 * Recovers an organization's key pair from its BIP39 mnemonic.
 *
 * Deterministic: the same mnemonic always yields the same keys.
 *
 * @param englishMnemonic - 12-word BIP39 English mnemonic
 * @returns PEM-encoded public and private keys
 * @throws {Error} If the mnemonic is invalid
 */
export async function recoverKeysFromMnemonic(
  englishMnemonic: string
): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  if (!validateMnemonic(englishMnemonic, wordlist)) {
    throw new Error("Invalid mnemonic phrase");
  }

  const keyPair = await generateKeyPairFromMnemonic(englishMnemonic);

  return {
    publicKey: keyPair.publicKeyPem,
    privateKey: keyPair.privateKeyPem,
  };
}

// Simple PEM encoding functions (not full ASN.1)
function encodePrivateKeyToPem(privateKeyBytes: Uint8Array): string {
  const keyData = arrayBufferToBase64(privateKeyBytes);
  return `-----BEGIN PRIVATE KEY-----\n${keyData}\n-----END PRIVATE KEY-----`;
}

function encodePublicKeyToPem(publicKeyBytes: Uint8Array): string {
  const keyData = arrayBufferToBase64(publicKeyBytes);
  return `-----BEGIN PUBLIC KEY-----\n${keyData}\n-----END PUBLIC KEY-----`;
}

// Generate deterministic ECDSA P-256 keys from seed phrase using Noble curves
async function deriveKeysFromSeed(seedPhrase: string): Promise<{
  privateKeyPem: string;
  publicKeyPem: string;
  privateKeyBytes: Uint8Array;
  publicKeyBytes: Uint8Array;
}> {
  const seed = await mnemonicToSeed(seedPhrase);

  // Generate private key using HKDF with counter for deterministic retry
  let privateKeyBytes: Uint8Array;
  let counter = 0;

  do {
    // Use HKDF with counter to ensure deterministic results across implementations
    privateKeyBytes = hkdf(
      sha256,
      seed,
      new Uint8Array([counter]),
      new TextEncoder().encode("ecdsa-key"),
      CRYPTO_CONSTANTS.ECDSA_PRIVATE_KEY_SIZE
    );
    counter++;
  } while (!p256.utils.isValidSecretKey(privateKeyBytes) && counter < 256);

  if (!p256.utils.isValidSecretKey(privateKeyBytes)) {
    throw new Error(
      "Failed to generate valid private key from seed after 256 attempts"
    );
  }

  // Generate deterministic ECDSA key pair using Noble curves
  const publicKeyBytes = p256.getPublicKey(privateKeyBytes, false); // uncompressed format

  // Simple PEM encoding (not full ASN.1)
  const privateKeyPem = encodePrivateKeyToPem(privateKeyBytes);
  const publicKeyPem = encodePublicKeyToPem(publicKeyBytes);

  return {
    privateKeyPem,
    publicKeyPem,
    privateKeyBytes,
    publicKeyBytes,
  };
}

async function generateKeyPairFromMnemonic(mnemonic: string): Promise<{
  privateKeyPem: string;
  publicKeyPem: string;
}> {
  const keys = await deriveKeysFromSeed(mnemonic);
  return {
    privateKeyPem: keys.privateKeyPem,
    publicKeyPem: keys.publicKeyPem,
  };
}

/**
 * Decodes a private key from simplified PEM format to raw bytes.
 *
 * Uses a simplified PEM encoding (raw base64, not full ASN.1/PKCS#8),
 * so these PEM strings are only compatible within this module.
 */
export function parsePrivateKeyFromPem(privateKeyPem: string): Uint8Array {
  const keyData = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  return new Uint8Array(base64ToArrayBuffer(keyData));
}

/**
 * Decodes a public key from simplified PEM format to raw uncompressed bytes (65 bytes).
 *
 * Uses a simplified PEM encoding (raw base64, not full ASN.1/SPKI),
 * so these PEM strings are only compatible within this module.
 */
export function parsePublicKeyFromPem(publicKeyPem: string): Uint8Array {
  const keyData = publicKeyPem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");

  return new Uint8Array(base64ToArrayBuffer(keyData));
}

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

/**
 * Generates a human-readable fingerprint from a public key PEM.
 *
 * Computes SHA-256 of the raw public key bytes, truncates to 16 bytes,
 * and formats as colon-separated uppercase hex (e.g. `"AB:CD:EF:..."`).
 *
 * @throws {Error} If the PEM cannot be parsed
 */
export function generateKeyFingerprint(publicKeyPem: string): string {
  try {
    const publicKeyBytes = parsePublicKeyFromPem(publicKeyPem);
    const hash = sha256(publicKeyBytes);

    // Convert to hex format with colons (first 16 bytes for readability)
    const fingerprintBytes = hash.slice(0, 16);
    return Array.from(fingerprintBytes)
      .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
      .join(':');
  } catch (error) {
    throw new Error(`Failed to generate key fingerprint: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Tests whether a private key can decrypt data encrypted with a public key.
 *
 * Performs a full encrypt/decrypt round-trip with test data.
 * Returns `false` (never throws) if the keys are incompatible.
 */
export async function testKeyCompatibility(
  privateKeyPem: string,
  publicKeyPem: string
): Promise<boolean> {
  try {
    const testMessage = "test-encryption-compatibility-" + Math.random();

    // Import the existing encryption functions (we'll need to use them)
    const { encryptPatientData, decryptPatientData } = await import('./encryption');

    // Create valid test data that matches PatientPII interface
    const testData = {
      firstName: "Test",
      lastName: "Patient",
      dateOfBirth: "1990-01-01",
      gender: "other",
      testValidationField: testMessage // Our validation field
    };

    // Encrypt test data with the public key
    const encryptedData = await encryptPatientData(testData, publicKeyPem);

    // Try to decrypt with the private key
    const decryptedData = await decryptPatientData(
      encryptedData,
      privateKeyPem
    );

    // Check if decryption succeeded and matches original
    return decryptedData.testValidationField === testMessage;
  } catch {
    // If encryption/decryption fails, keys are incompatible
    return false;
  }
}

/**
 * Validates that a public key matches a private key by deriving the public
 * key from the private key and comparing byte-by-byte.
 *
 * Faster than {@link testKeyCompatibility} (no encryption round-trip),
 * but only checks mathematical relationship, not encrypt/decrypt capability.
 */
export function validateKeyPair(
  privateKeyPem: string,
  publicKeyPem: string
): boolean {
  try {
    const privateBytes = parsePrivateKeyFromPem(privateKeyPem);
    const publicBytes = parsePublicKeyFromPem(publicKeyPem);
    const derivedPublic = p256.getPublicKey(privateBytes, false);

    // Compare the derived public key with the provided public key
    if (derivedPublic.length !== publicBytes.length) {
      return false;
    }

    for (let i = 0; i < derivedPublic.length; i++) {
      if (derivedPublic[i] !== publicBytes[i]) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
