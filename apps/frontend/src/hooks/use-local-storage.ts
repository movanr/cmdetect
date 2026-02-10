import { useCallback, useEffect, useRef, useState } from "react";

export interface UseLocalStorageOptions<T> {
  /** Custom serializer (default: JSON.stringify) */
  serializer?: (value: T) => string;
  /** Custom deserializer (default: JSON.parse) */
  deserializer?: (value: string) => T;
  /** Enable cross-tab synchronization via storage event (default: false) */
  syncTabs?: boolean;
  /** Error logger (default: console.error) */
  onError?: (error: Error) => void;
}

/**
 * Generic localStorage hook with SSR safety and cross-tab sync support.
 *
 * @param key - The localStorage key
 * @param defaultValue - Default value when key doesn't exist
 * @param options - Configuration options
 * @returns Tuple of [value, setValue, removeValue]
 *
 * @example
 * const [name, setName, removeName] = useLocalStorage("user-name", "");
 * const [settings, setSettings] = useLocalStorage("app-settings", { theme: "light" });
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncTabs = false,
    onError = console.error,
  } = options;

  // Read initial value from localStorage
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item !== null ? deserializer(item) : defaultValue;
    } catch (error) {
      onError(
        new Error(`Error reading localStorage key "${key}": ${error}`)
      );
      return defaultValue;
    }
  }, [key, defaultValue, deserializer, onError]);

  // State to track current value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Ref to access current value without adding it as a useCallback dependency,
  // keeping setValue identity stable across renders.
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  // Set value to localStorage and state
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Handle function updater pattern
        const valueToStore =
          value instanceof Function ? value(storedValueRef.current) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          localStorage.setItem(key, serializer(valueToStore));

          // Dispatch storage event for same-tab listeners
          window.dispatchEvent(
            new StorageEvent("storage", {
              key,
              newValue: serializer(valueToStore),
              storageArea: localStorage,
            })
          );
        }
      } catch (error) {
        onError(
          new Error(`Error setting localStorage key "${key}": ${error}`)
        );
      }
    },
    [key, serializer, onError]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);

      if (typeof window !== "undefined") {
        localStorage.removeItem(key);

        // Dispatch storage event for same-tab listeners
        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            newValue: null,
            storageArea: localStorage,
          })
        );
      }
    } catch (error) {
      onError(
        new Error(`Error removing localStorage key "${key}": ${error}`)
      );
    }
  }, [key, defaultValue, onError]);

  // Cross-tab synchronization
  useEffect(() => {
    if (!syncTabs || typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key || event.storageArea !== localStorage) {
        return;
      }

      try {
        const newValue =
          event.newValue !== null
            ? deserializer(event.newValue)
            : defaultValue;
        setStoredValue(newValue);
      } catch (error) {
        onError(
          new Error(
            `Error syncing localStorage key "${key}" from other tab: ${error}`
          )
        );
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, defaultValue, deserializer, syncTabs, onError]);

  return [storedValue, setValue, removeValue];
}

/**
 * Subscribe to localStorage changes for a specific key.
 * Useful for creating reactive localStorage subscriptions.
 */
export function subscribeToLocalStorage(
  key: string,
  callback: () => void
): () => void {
  const handleChange = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      callback();
    }
  };

  window.addEventListener("storage", handleChange);
  return () => window.removeEventListener("storage", handleChange);
}

/**
 * Get a snapshot of localStorage value (for useSyncExternalStore).
 */
export function getLocalStorageSnapshot<T>(
  key: string,
  defaultValue: T,
  deserializer: (value: string) => T = JSON.parse
): T {
  try {
    const item = localStorage.getItem(key);
    return item !== null ? deserializer(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}
