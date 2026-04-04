/**
 * Key setup bypass — generates a deterministic key pair and injects it
 * into the browser's IndexedDB + the Hasura organization record.
 * No app code changes needed.
 */

import { mnemonicToSeed, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { p256 } from "@noble/curves/nist.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import type { Page } from "playwright";

// Fixed test mnemonic — always produces the same key pair
const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const ECDSA_PRIVATE_KEY_SIZE = 32;

// IndexedDB constants (from apps/frontend/src/crypto/storage.ts)
const DB_NAME = "CMDetectCrypto";
const DB_VERSION = 1;
const STORE_NAME = "privateKeys";
const KEY_ID = "organization_private_key";

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function encodePrivateKeyToPem(privateKeyBytes: Uint8Array): string {
  const keyData = arrayBufferToBase64(privateKeyBytes);
  return `-----BEGIN PRIVATE KEY-----\n${keyData}\n-----END PRIVATE KEY-----`;
}

function encodePublicKeyToPem(publicKeyBytes: Uint8Array): string {
  const keyData = arrayBufferToBase64(publicKeyBytes);
  return `-----BEGIN PUBLIC KEY-----\n${keyData}\n-----END PUBLIC KEY-----`;
}

function parsePublicKeyFromPem(publicKeyPem: string): Uint8Array {
  const keyData = publicKeyPem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");
  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function generateKeyFingerprint(publicKeyPem: string): string {
  const publicKeyBytes = parsePublicKeyFromPem(publicKeyPem);
  const hash = sha256(publicKeyBytes);
  const fingerprintBytes = hash.slice(0, 16);
  return Array.from(fingerprintBytes)
    .map((byte: number) => byte.toString(16).padStart(2, "0").toUpperCase())
    .join(":");
}

/**
 * Derives a deterministic P-256 key pair from the test mnemonic.
 * Same algorithm as apps/frontend/src/crypto/keyGeneration.ts
 */
export async function deriveTestKeys(): Promise<{
  publicKeyPem: string;
  privateKeyPem: string;
  fingerprint: string;
}> {
  if (!validateMnemonic(TEST_MNEMONIC, wordlist)) {
    throw new Error("Invalid test mnemonic");
  }

  const seed = await mnemonicToSeed(TEST_MNEMONIC);

  let privateKeyBytes: Uint8Array;
  let counter = 0;
  do {
    privateKeyBytes = hkdf(
      sha256,
      seed,
      new Uint8Array([counter]),
      new TextEncoder().encode("ecdsa-key"),
      ECDSA_PRIVATE_KEY_SIZE
    );
    counter++;
  } while (!p256.utils.isValidSecretKey(privateKeyBytes) && counter < 256);

  if (!p256.utils.isValidSecretKey(privateKeyBytes)) {
    throw new Error("Failed to derive valid private key");
  }

  const publicKeyBytes = p256.getPublicKey(privateKeyBytes, false);
  const publicKeyPem = encodePublicKeyToPem(publicKeyBytes);
  const privateKeyPem = encodePrivateKeyToPem(privateKeyBytes);
  const fingerprint = generateKeyFingerprint(publicKeyPem);

  return { publicKeyPem, privateKeyPem, fingerprint };
}

/**
 * Sets the organization's public key in Hasura via admin API.
 */
export async function ensureOrganizationKeys(
  orgId: string,
  hasuraUrl: string,
  hasuraAdminSecret: string,
  publicKeyPem: string,
  fingerprint: string
): Promise<void> {
  const mutation = `
    mutation SetOrgKey($id: String!, $public_key_pem: String!, $key_fingerprint: String!, $key_created_at: timestamptz!) {
      update_organization_by_pk(
        pk_columns: { id: $id }
        _set: {
          public_key_pem: $public_key_pem
          key_fingerprint: $key_fingerprint
          key_created_at: $key_created_at
        }
      ) {
        id
      }
    }
  `;

  const response = await fetch(`${hasuraUrl}/v1/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": hasuraAdminSecret,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        id: orgId,
        public_key_pem: publicKeyPem,
        key_fingerprint: fingerprint,
        key_created_at: new Date().toISOString(),
      },
    }),
  });

  const result = (await response.json()) as {
    errors?: Array<{ message: string }>;
  };
  if (result.errors) {
    throw new Error(
      `Failed to set org key: ${result.errors[0].message}`
    );
  }
}

/**
 * Injects the private key into the browser's IndexedDB.
 * Must be called after navigating to the app's origin (e.g. /login).
 */
export async function injectPrivateKey(
  page: Page,
  privateKeyPem: string
): Promise<void> {
  await page.evaluate(
    ({ dbName, dbVersion, storeName, keyId, keyPem }) => {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = () => reject(new Error("Failed to open IndexedDB"));

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction([storeName], "readwrite");
          const store = tx.objectStore(storeName);
          const putRequest = store.put(keyPem, keyId);

          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () =>
            reject(new Error("Failed to store private key"));

          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(new Error("Transaction failed"));
        };
      });
    },
    {
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
      storeName: STORE_NAME,
      keyId: KEY_ID,
      keyPem: privateKeyPem,
    }
  );
}
