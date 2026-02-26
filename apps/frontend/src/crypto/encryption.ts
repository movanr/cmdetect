import { CRYPTO_CONSTANTS } from "./types";
import type { PatientPII, EncryptedPayload, CryptoError } from "./types";
import { parsePublicKeyFromPem, parsePrivateKeyFromPem } from "./keyGeneration";
import { p256 } from "@noble/curves/nist";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";

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

export async function decryptPatientData(
  encryptedData: string,
  privateKeyPem: string
): Promise<PatientPII> {
  try {
    const payload: EncryptedPayload = JSON.parse(encryptedData);

    if (payload.version !== CRYPTO_CONSTANTS.ENCRYPTION_VERSION) {
      throw new Error(`Unsupported encryption version: ${payload.version}`);
    }

    // ECIES Decryption: Reverse of the encryption process using Noble curves

    // 1. Parse our private key
    const privateKeyBytes = parsePrivateKeyFromPem(privateKeyPem);

    // 2. Parse ephemeral public key from the payload
    const ephemeralPublicKeyBytes = new Uint8Array(
      base64ToArrayBuffer(payload.ephemeralPublicKey)
    );

    // 3. Perform ECDH using Noble curves to recreate the same shared secret
    const sharedPoint = p256.getSharedSecret(
      privateKeyBytes,
      ephemeralPublicKeyBytes
    );
    const sharedSecret = sharedPoint.slice(1, 33); // Extract x-coordinate (32 bytes)

    // 4. Derive the same AES key using HKDF
    const salt = new Uint8Array(); // Same empty salt as encryption
    const info = new TextEncoder().encode("ECIES-AES-KEY"); // Same context info
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
      ["decrypt"]
    );

    // 5. Decrypt the patient data
    const encryptedPatientDataBuffer = base64ToArrayBuffer(
      payload.encryptedData
    );
    const ivBuffer = base64ToArrayBuffer(payload.iv);

    const decryptedPatientDataBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      aesKey,
      encryptedPatientDataBuffer
    );

    const decryptedPatientDataString = new TextDecoder().decode(
      decryptedPatientDataBuffer
    );
    const patientData: PatientPII = JSON.parse(decryptedPatientDataString);

    validatePatientPII(patientData);

    return patientData;
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "DecryptionError",
      message: `Failed to decrypt patient data: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "DECRYPTION_FAILED",
    };
    throw cryptoError;
  }
}

function validatePatientPII(data: unknown): asserts data is PatientPII {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid patient data: must be an object");
  }

  const obj = data as Record<string, unknown>;
  const required = ["firstName", "lastName", "dateOfBirth"];
  for (const field of required) {
    if (typeof obj[field] !== "string" || !(obj[field] as string).trim()) {
      throw new Error(
        `Invalid patient data: ${field} must be a non-empty string`
      );
    }
  }

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(obj["dateOfBirth"] as string)) {
    throw new Error(
      "Invalid patient data: dateOfBirth must be in YYYY-MM-DD format"
    );
  }
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
  return bytes.buffer;
}
