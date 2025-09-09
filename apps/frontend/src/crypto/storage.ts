import { CRYPTO_ALGORITHMS, CRYPTO_CONSTANTS } from "./types";
import type {
  StoredKey,
  CryptoError,
  MultiUserStoredKey,
  UserKeyInfo,
} from "./types";

const DB_NAME = "CMDetectCrypto";
const DB_VERSION = 1;
const STORE_NAME = "privateKeys";
const MULTI_USER_KEY_ID = "multi_user_private_keys";

// Note: getUserKeyId not needed since we use multi-user storage structure

export async function storePrivateKey(
  privateKey: string,
  password: string,
  userId: string
): Promise<void> {
  try {
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!userId) {
      throw new Error("User ID is required");
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
      encryptedKey: arrayBufferToBase64(new Uint8Array(encryptedPrivateKey)),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
      createdAt: new Date().toISOString(),
    };

    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Get existing multi-user keys or create new structure
    const existingKeys = await new Promise<MultiUserStoredKey>(
      (resolve, reject) => {
        const request = store.get(MULTI_USER_KEY_ID);
        request.onsuccess = () => resolve(request.result || {});
        request.onerror = () =>
          reject(new Error("Failed to read existing keys"));
      }
    );

    // Update with new user key
    existingKeys[userId] = storedKey;

    await new Promise<void>((resolve, reject) => {
      const request = store.put(existingKeys, MULTI_USER_KEY_ID);
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

export async function loadPrivateKey(
  password: string,
  userId: string
): Promise<string> {
  try {
    if (!password) {
      throw new Error("Password is required");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const multiUserKeys = await new Promise<MultiUserStoredKey>(
      (resolve, reject) => {
        const request = store.get(MULTI_USER_KEY_ID);
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result as MultiUserStoredKey);
          } else {
            reject(new Error("No private keys found"));
          }
        };
        request.onerror = () =>
          reject(new Error("Failed to load private keys"));
      }
    );

    const storedKey = multiUserKeys[userId];
    if (!storedKey) {
      throw new Error(`No private key found for user: ${userId}`);
    }

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

export async function hasStoredPrivateKey(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      return false;
    }

    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return await new Promise<boolean>((resolve, reject) => {
      const request = store.get(MULTI_USER_KEY_ID);
      request.onsuccess = () => {
        const multiUserKeys = request.result as MultiUserStoredKey;
        resolve(!!(multiUserKeys && multiUserKeys[userId]));
      };
      request.onerror = () =>
        reject(new Error("Failed to check for stored key"));
    });
  } catch (error) {
    return false;
  }
}

export async function deleteStoredPrivateKey(userId: string): Promise<void> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Get existing multi-user keys
    const existingKeys = await new Promise<MultiUserStoredKey>(
      (resolve, reject) => {
        const request = store.get(MULTI_USER_KEY_ID);
        request.onsuccess = () => resolve(request.result || {});
        request.onerror = () =>
          reject(new Error("Failed to read existing keys"));
      }
    );

    // Remove the specific user's key
    if (existingKeys[userId]) {
      delete existingKeys[userId];

      // Update the storage with remaining keys
      await new Promise<void>((resolve, reject) => {
        const request = store.put(existingKeys, MULTI_USER_KEY_ID);
        request.onsuccess = () => resolve();
        request.onerror = () =>
          reject(new Error("Failed to delete private key"));
      });
    }

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

// New multi-user management functions
export async function listStoredUsers(): Promise<string[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return await new Promise<string[]>((resolve, reject) => {
      const request = store.get(MULTI_USER_KEY_ID);
      request.onsuccess = () => {
        const multiUserKeys = request.result as MultiUserStoredKey;
        resolve(multiUserKeys ? Object.keys(multiUserKeys) : []);
      };
      request.onerror = () => reject(new Error("Failed to list stored users"));
    });
  } catch (error) {
    return [];
  }
}

export async function deleteAllStoredKeys(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(MULTI_USER_KEY_ID);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error("Failed to delete all stored keys"));
    });

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Transaction failed"));
    });
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "StorageError",
      message: `Failed to delete all stored keys: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "STORAGE_DELETE_FAILED",
    };
    throw cryptoError;
  }
}

export async function getUserKeyInfo(userId: string): Promise<UserKeyInfo> {
  try {
    if (!userId) {
      return { exists: false, createdAt: null };
    }

    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return await new Promise<UserKeyInfo>((resolve, reject) => {
      const request = store.get(MULTI_USER_KEY_ID);
      request.onsuccess = () => {
        const multiUserKeys = request.result as MultiUserStoredKey;
        if (multiUserKeys && multiUserKeys[userId]) {
          resolve({
            exists: true,
            createdAt: multiUserKeys[userId].createdAt,
          });
        } else {
          resolve({ exists: false, createdAt: null });
        }
      };
      request.onerror = () => reject(new Error("Failed to get user key info"));
    });
  } catch (error) {
    return { exists: false, createdAt: null };
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
