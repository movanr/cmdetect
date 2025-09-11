import { CRYPTO_ALGORITHMS, CRYPTO_CONSTANTS } from "./types";
import type { StoredKey, CryptoError } from "./types";

const DB_NAME = "CMDetectCrypto";
const DB_VERSION = 1;
const STORE_NAME = "privateKeys";
const KEY_ID = "organization_private_key";

export async function storePrivateKey(
  privateKey: string,
  password: string
): Promise<void> {
  try {
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const salt = crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONSTANTS.KEY_DERIVATION_SALT_SIZE)
    );
    const iv = crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONSTANTS.AES_IV_SIZE)
    );

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: CRYPTO_ALGORITHMS.PBKDF2.name },
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: CRYPTO_ALGORITHMS.PBKDF2.name,
        salt: salt,
        iterations: CRYPTO_CONSTANTS.PBKDF2_ITERATIONS,
        hash: CRYPTO_ALGORITHMS.PBKDF2.hash,
      },
      keyMaterial,
      {
        name: CRYPTO_ALGORITHMS.AES.name,
        length: CRYPTO_ALGORITHMS.AES.length,
      },
      false,
      ["encrypt"]
    );

    const privateKeyBuffer = new TextEncoder().encode(privateKey);
    const encryptedPrivateKey = await crypto.subtle.encrypt(
      {
        name: CRYPTO_ALGORITHMS.AES.name,
        iv: iv,
      },
      derivedKey,
      privateKeyBuffer
    );

    const storedKey: StoredKey = {
      encryptedKey: arrayBufferToBase64(encryptedPrivateKey),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
    };

    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(storedKey, KEY_ID);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to store private key"));
    });

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Transaction failed"));
    });
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "StorageError",
      message: `Failed to store private key: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "STORAGE_FAILED",
    };
    throw cryptoError;
  }
}

export async function loadPrivateKey(password: string): Promise<string> {
  try {
    if (!password) {
      throw new Error("Password is required");
    }

    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const storedKey = await new Promise<StoredKey>((resolve, reject) => {
      const request = store.get(KEY_ID);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result as StoredKey);
        } else {
          reject(new Error("No private key found"));
        }
      };
      request.onerror = () => reject(new Error("Failed to load private key"));
    });

    const salt = base64ToArrayBuffer(storedKey.salt);
    const iv = base64ToArrayBuffer(storedKey.iv);
    const encryptedKey = base64ToArrayBuffer(storedKey.encryptedKey);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: CRYPTO_ALGORITHMS.PBKDF2.name },
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: CRYPTO_ALGORITHMS.PBKDF2.name,
        salt: salt,
        iterations: CRYPTO_CONSTANTS.PBKDF2_ITERATIONS,
        hash: CRYPTO_ALGORITHMS.PBKDF2.hash,
      },
      keyMaterial,
      {
        name: CRYPTO_ALGORITHMS.AES.name,
        length: CRYPTO_ALGORITHMS.AES.length,
      },
      false,
      ["decrypt"]
    );

    const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
      {
        name: CRYPTO_ALGORITHMS.AES.name,
        iv: iv,
      },
      derivedKey,
      encryptedKey
    );

    const privateKey = new TextDecoder().decode(decryptedPrivateKeyBuffer);

    if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      throw new Error("Invalid password or corrupted key");
    }

    return privateKey;
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "StorageError",
      message: `Failed to load private key: ${error instanceof Error ? error.message : "Unknown error"}`,
      code:
        error instanceof Error && error.message.includes("password")
          ? "INVALID_PASSWORD"
          : "STORAGE_LOAD_FAILED",
    };
    throw cryptoError;
  }
}

export async function hasStoredPrivateKey(): Promise<boolean> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return await new Promise<boolean>((resolve, reject) => {
      const request = store.get(KEY_ID);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () =>
        reject(new Error("Failed to check for stored key"));
    });
  } catch (error) {
    return false;
  }
}

export async function deleteStoredPrivateKey(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(KEY_ID);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to delete private key"));
    });

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Transaction failed"));
    });
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "StorageError",
      message: `Failed to delete private key: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "STORAGE_DELETE_FAILED",
    };
    throw cryptoError;
  }
}

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
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
