import type { CryptoError } from "./types";

const DB_NAME = "CMDetectCrypto";
const DB_VERSION = 1;
const STORE_NAME = "privateKeys";
const KEY_ID = "organization_private_key";

export async function storePrivateKey(privateKey: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(privateKey, KEY_ID);
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

export async function loadPrivateKey(): Promise<string | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return await new Promise<string | null>((resolve, reject) => {
      const request = store.get(KEY_ID);
      request.onsuccess = () => {
        const privateKey = request.result as string | undefined;
        resolve(privateKey || null);
      };
      request.onerror = () => reject(new Error("Failed to load private key"));
    });
  } catch (error) {
    const cryptoError: CryptoError = {
      name: "StorageError",
      message: `Failed to load private key: ${error instanceof Error ? error.message : "Unknown error"}`,
      code: "STORAGE_LOAD_FAILED",
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

