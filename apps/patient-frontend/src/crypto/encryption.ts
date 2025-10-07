import { CRYPTO_CONSTANTS } from "./types";
import type { PatientPII, EncryptedPayload, CryptoError } from "./types";
import { parsePublicKeyFromPem } from "./keyUtils";
import { p256 } from "@noble/curves/nist";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";

/**
 * Encrypts patient data using ECIES (Elliptic Curve Integrated Encryption Scheme)
 * with the organization's public key.
 *
 * This function is used by patients to encrypt their personal information
 * before submitting it to the server.
 *
 * @param patientData - The patient's personal information to encrypt
 * @param publicKeyPem - The organization's public key in PEM format (from server)
 * @returns JSON string containing the encrypted payload
 */
export async function encryptPatientData(
  patientData: PatientPII,
  publicKeyPem: string
): Promise<string> {
  try {
    // Manual ECIES Implementation using Noble curves + WebCrypto AES

    // 1. Generate ephemeral ECDSA keypair using Noble curves
    const ephemeralPrivateKey = p256.utils.randomSecretKey();
    const ephemeralPublicKey = p256.getPublicKey(ephemeralPrivateKey, false); // uncompressed

    // 2. Parse recipient's public key
    const recipientPublicKeyBytes = parsePublicKeyFromPem(publicKeyPem);

    // 3. Perform ECDH using Noble curves to get shared secret
    const sharedPoint = p256.getSharedSecret(
      ephemeralPrivateKey,
      recipientPublicKeyBytes
    );
    const sharedSecret = sharedPoint.slice(1, 33); // Extract x-coordinate (32 bytes)

    // 4. Derive AES key from shared secret using HKDF
    const salt = new Uint8Array(); // Empty salt for simplicity
    const info = new TextEncoder().encode("ECIES-AES-KEY"); // Context info
    const aesKeyMaterial = hkdf(sha256, sharedSecret, salt, info, 32);

    const aesKey = await crypto.subtle.importKey(
      "raw",
      aesKeyMaterial.buffer.slice(
        aesKeyMaterial.byteOffset,
        aesKeyMaterial.byteOffset + aesKeyMaterial.byteLength
      ) as BufferSource,
      {
        name: "AES-GCM",
      },
      false,
      ["encrypt"]
    );

    // 5. Encrypt patient data with AES-GCM
    const iv = crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONSTANTS.AES_IV_SIZE)
    );
    const patientDataString = JSON.stringify(patientData);
    const patientDataBuffer = new TextEncoder().encode(patientDataString);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      patientDataBuffer
    );

    // 6. Create ECIES payload with ephemeral public key
    const payload: EncryptedPayload = {
      ephemeralPublicKey: arrayBufferToBase64(ephemeralPublicKey),
      encryptedData: arrayBufferToBase64(new Uint8Array(encryptedData)),
      iv: arrayBufferToBase64(iv),
      version: CRYPTO_CONSTANTS.ENCRYPTION_VERSION,
    };

    return JSON.stringify(payload);
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "EncryptionError",
      message: `Failed to encrypt patient data: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "ENCRYPTION_FAILED",
    };
    throw cryptoError;
  }
}

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
