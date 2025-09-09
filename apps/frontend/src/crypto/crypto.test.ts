import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./test-setup";
import {
  generateOrganizationKeys,
  recoverKeysFromMnemonic,
  encryptPatientData,
  decryptPatientData,
  storePrivateKey,
  loadPrivateKey,
  hasStoredPrivateKey,
  deleteStoredPrivateKey,
  verifyDeterministicKeys,
  validateKeyPair,
  listStoredUsers,
  deleteAllStoredKeys,
  getUserKeyInfo,
} from "./index";
import type { PatientPII } from "./index";

describe("Healthcare Encryption MVP", () => {
  const testPassword = "testPassword123!";
  const testUserId = "test-user-123";
  const samplePatientData: PatientPII = {
    firstName: "Max",
    lastName: "Mustermann",
    dateOfBirth: "1990-05-15",
    gender: "male",
  };

  beforeEach(async () => {
    if (await hasStoredPrivateKey(testUserId)) {
      await deleteStoredPrivateKey(testUserId);
    }
  });

  describe("Key Generation with English BIP39", () => {
    it("should generate ECDSA keys with BIP39 mnemonic", async () => {
      const result = await generateOrganizationKeys();

      expect(result.publicKey).toContain("-----BEGIN PUBLIC KEY-----");
      expect(result.privateKey).toContain("-----BEGIN PRIVATE KEY-----");
      expect(result.englishMnemonic).toBeDefined();
      expect(result.englishMnemonic.split(" ")).toHaveLength(12);

      const words = result.englishMnemonic.split(" ");
      words.forEach((word: string) => {
        expect(word).toMatch(/^[a-z]+$/);
      });
    });

    it("should generate DETERMINISTIC keys from BIP39 mnemonic", async () => {
      const original = await generateOrganizationKeys();
      const recovered = await recoverKeysFromMnemonic(original.englishMnemonic);

      // With ECDSA, same mnemonic should generate identical keys
      expect(recovered.publicKey).toBe(original.publicKey);
      expect(recovered.privateKey).toBe(original.privateKey);
      expect(recovered.publicKey).toContain("-----BEGIN PUBLIC KEY-----");
      expect(recovered.privateKey).toContain("-----BEGIN PRIVATE KEY-----");
    });

    it("should generate different keys each time", async () => {
      const keys1 = await generateOrganizationKeys();
      const keys2 = await generateOrganizationKeys();

      expect(keys1.publicKey).not.toBe(keys2.publicKey);
      expect(keys1.privateKey).not.toBe(keys2.privateKey);
      expect(keys1.englishMnemonic).not.toBe(keys2.englishMnemonic);
    });

    it("should verify deterministic key generation", async () => {
      const testMnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

      // Verify that the same mnemonic always generates the same keys
      const isDeterministic = await verifyDeterministicKeys(testMnemonic);
      expect(isDeterministic).toBe(true);

      // Test multiple times to be sure
      for (let i = 0; i < 3; i++) {
        const keys1 = await recoverKeysFromMnemonic(testMnemonic);
        const keys2 = await recoverKeysFromMnemonic(testMnemonic);
        expect(keys1.publicKey).toBe(keys2.publicKey);
        expect(keys1.privateKey).toBe(keys2.privateKey);
      }
    });
  });

  describe("ECIES (ECDH+AES) Encryption/Decryption", () => {
    it("should encrypt and decrypt patient data correctly", async () => {
      const keys = await generateOrganizationKeys();

      const encrypted = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );
      const decrypted = await decryptPatientData(encrypted, keys.privateKey);

      expect(decrypted).toEqual(samplePatientData);
    });

    it("should produce different encrypted data each time", async () => {
      const keys = await generateOrganizationKeys();

      const encrypted1 = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );
      const encrypted2 = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );

      expect(encrypted1).not.toBe(encrypted2);

      const decrypted1 = await decryptPatientData(encrypted1, keys.privateKey);
      const decrypted2 = await decryptPatientData(encrypted2, keys.privateKey);

      expect(decrypted1).toEqual(samplePatientData);
      expect(decrypted2).toEqual(samplePatientData);
    });

    it("should validate ECIES payload structure", async () => {
      const keys = await generateOrganizationKeys();
      const encrypted = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );

      const payload = JSON.parse(encrypted);
      expect(payload).toHaveProperty("ephemeralPublicKey");
      expect(payload).toHaveProperty("encryptedData");
      expect(payload).toHaveProperty("iv");
      expect(payload).toHaveProperty("version");
      expect(payload.version).toBe("1"); // ECIES is now version 1
    });

    it("should fail to decrypt with wrong private key", async () => {
      const keys1 = await generateOrganizationKeys();
      const keys2 = await generateOrganizationKeys();

      const encrypted = await encryptPatientData(
        samplePatientData,
        keys1.publicKey
      );

      await expect(
        decryptPatientData(encrypted, keys2.privateKey)
      ).rejects.toThrow();
    });

    it("should validate patient data structure", async () => {
      const keys = await generateOrganizationKeys();

      const invalidData = {
        firstName: "Max",
        lastName: "", // Invalid: empty string
        dateOfBirth: "1990-05-15",
        gender: "male",
      } as PatientPII;

      await expect(
        encryptPatientData(invalidData, keys.publicKey).then((encrypted) =>
          decryptPatientData(encrypted, keys.privateKey)
        )
      ).rejects.toThrow("lastName must be a non-empty string");
    });

    it("should validate date format", async () => {
      const keys = await generateOrganizationKeys();

      const invalidData = {
        firstName: "Max",
        lastName: "Mustermann",
        dateOfBirth: "15/05/1990", // Invalid format
        gender: "male",
      } as PatientPII;

      const encrypted = await encryptPatientData(invalidData, keys.publicKey);
      await expect(
        decryptPatientData(encrypted, keys.privateKey)
      ).rejects.toThrow("dateOfBirth must be in YYYY-MM-DD format");
    });

    it("should enable end-to-end deterministic recovery workflow", async () => {
      // This test demonstrates the key new functionality:
      // Same mnemonic = same keys = can decrypt all organization data

      const testMnemonic =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

      // 1. Generate keys from mnemonic (organization setup)
      const orgKeys1 = await recoverKeysFromMnemonic(testMnemonic);

      // 2. Encrypt patient data with organization public key
      const encryptedData = await encryptPatientData(
        samplePatientData,
        orgKeys1.publicKey
      );

      // 3. Later: recover keys from same mnemonic (device setup)
      const orgKeys2 = await recoverKeysFromMnemonic(testMnemonic);

      // 4. Keys should be identical
      expect(orgKeys2.publicKey).toBe(orgKeys1.publicKey);
      expect(orgKeys2.privateKey).toBe(orgKeys1.privateKey);

      // 5. Can decrypt data encrypted with the original keys
      const decryptedData = await decryptPatientData(
        encryptedData,
        orgKeys2.privateKey
      );
      expect(decryptedData).toEqual(samplePatientData);

      // This proves the 12-word mnemonic is a complete backup of encryption capability!
    });
  });

  describe("Security Validation", () => {
    it("should validate matching key pairs", async () => {
      const keys = await generateOrganizationKeys();

      const isValid = validateKeyPair(keys.privateKey, keys.publicKey);
      expect(isValid).toBe(true);
    });

    it("should reject mismatched key pairs", async () => {
      const keys1 = await generateOrganizationKeys();
      const keys2 = await generateOrganizationKeys();

      const isValid = validateKeyPair(keys1.privateKey, keys2.publicKey);
      expect(isValid).toBe(false);
    });

    it("should handle malformed PEM files", () => {
      const invalidPrivateKey =
        "-----BEGIN PRIVATE KEY-----\ninvalid\n-----END PRIVATE KEY-----";
      const invalidPublicKey =
        "-----BEGIN PUBLIC KEY-----\ninvalid\n-----END PUBLIC KEY-----";

      const isValid = validateKeyPair(invalidPrivateKey, invalidPublicKey);
      expect(isValid).toBe(false);
    });

    it("should reject invalid mnemonic phrases", async () => {
      const invalidMnemonic = "invalid mnemonic phrase that does not exist";

      await expect(recoverKeysFromMnemonic(invalidMnemonic)).rejects.toThrow(
        "Invalid mnemonic phrase"
      );

      await expect(verifyDeterministicKeys(invalidMnemonic)).rejects.toThrow(
        "Invalid mnemonic phrase"
      );
    });

    it("should generate valid ECDSA private keys from seed", async () => {
      // Test multiple seeds to ensure normalization works
      const testMnemonics = [
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
        "legal winner thank year wave sausage worth useful legal winner thank yellow",
        "letter advice cage absurd amount doctor acoustic avoid letter advice cage above",
      ];

      for (const mnemonic of testMnemonics) {
        const keys = await recoverKeysFromMnemonic(mnemonic);

        // Validate the key pair is mathematically correct
        const isValid = validateKeyPair(keys.privateKey, keys.publicKey);
        expect(isValid).toBe(true);

        // Ensure encryption/decryption works
        const encrypted = await encryptPatientData(
          samplePatientData,
          keys.publicKey
        );
        const decrypted = await decryptPatientData(encrypted, keys.privateKey);
        expect(decrypted).toEqual(samplePatientData);
      }
    });

    it("should handle large patient data encryption", async () => {
      const largePatientData: PatientPII = {
        firstName: "Test".repeat(100),
        lastName: "Patient".repeat(100),
        dateOfBirth: "1990-01-01",
        gender: "other",
        medicalHistory: "A".repeat(10000), // 10KB of data
        medications: Array(100).fill("medication-name-").join(","),
        allergies: Array(50).fill("allergy-").join(","),
      };

      const keys = await generateOrganizationKeys();
      const encrypted = await encryptPatientData(
        largePatientData,
        keys.publicKey
      );
      const decrypted = await decryptPatientData(encrypted, keys.privateKey);

      expect(decrypted).toEqual(largePatientData);
    });

    it("should ensure encryption is non-deterministic", async () => {
      const keys = await generateOrganizationKeys();

      const encrypted1 = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );
      const encrypted2 = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );
      const encrypted3 = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );

      // All ciphertexts should be different due to random ephemeral keys and IVs
      expect(encrypted1).not.toBe(encrypted2);
      expect(encrypted2).not.toBe(encrypted3);
      expect(encrypted1).not.toBe(encrypted3);

      // But all should decrypt to the same plaintext
      const decrypted1 = await decryptPatientData(encrypted1, keys.privateKey);
      const decrypted2 = await decryptPatientData(encrypted2, keys.privateKey);
      const decrypted3 = await decryptPatientData(encrypted3, keys.privateKey);

      expect(decrypted1).toEqual(samplePatientData);
      expect(decrypted2).toEqual(samplePatientData);
      expect(decrypted3).toEqual(samplePatientData);
    });
  });

  describe("IndexedDB Storage with Password Protection", () => {
    it("should store and load private key with password", async () => {
      const keys = await generateOrganizationKeys();

      await storePrivateKey(keys.privateKey, testPassword, testUserId);
      const loaded = await loadPrivateKey(testPassword, testUserId);

      expect(loaded).toBe(keys.privateKey);
    });

    it("should detect stored private key", async () => {
      const keys = await generateOrganizationKeys();

      expect(await hasStoredPrivateKey(testUserId)).toBe(false);

      await storePrivateKey(keys.privateKey, testPassword, testUserId);
      expect(await hasStoredPrivateKey(testUserId)).toBe(true);
    });

    it("should fail to load with wrong password", async () => {
      const keys = await generateOrganizationKeys();
      await storePrivateKey(keys.privateKey, testPassword, testUserId);

      await expect(
        loadPrivateKey("wrongPassword", testUserId)
      ).rejects.toThrow();
    });

    it("should delete stored private key", async () => {
      const keys = await generateOrganizationKeys();
      await storePrivateKey(keys.privateKey, testPassword, testUserId);

      expect(await hasStoredPrivateKey(testUserId)).toBe(true);

      await deleteStoredPrivateKey(testUserId);
      expect(await hasStoredPrivateKey(testUserId)).toBe(false);
    });

    it("should require minimum password length", async () => {
      const keys = await generateOrganizationKeys();

      await expect(
        storePrivateKey(keys.privateKey, "1234567", testUserId) // 7 chars, too short
      ).rejects.toThrow("Password must be at least 8 characters long");
    });
  });

  describe("End-to-End Integration", () => {
    it("should complete full workflow: generate → encrypt → store → load → decrypt", async () => {
      // Generate keys
      const keys = await generateOrganizationKeys();

      // Encrypt patient data
      const encrypted = await encryptPatientData(
        samplePatientData,
        keys.publicKey
      );

      // Store private key
      await storePrivateKey(keys.privateKey, testPassword, testUserId);

      // Load private key
      const loadedPrivateKey = await loadPrivateKey(testPassword, testUserId);

      // Decrypt patient data
      const decrypted = await decryptPatientData(encrypted, loadedPrivateKey);

      expect(decrypted).toEqual(samplePatientData);
    });

    it("should demonstrate backup workflow with stored keys", async () => {
      // Generate original keys
      const original = await generateOrganizationKeys();

      // Store the keys securely
      await storePrivateKey(original.privateKey, testPassword, testUserId);

      // Encrypt data with public key
      const encrypted = await encryptPatientData(
        samplePatientData,
        original.publicKey
      );

      // Load keys from storage (simulating recovery)
      const recoveredPrivateKey = await loadPrivateKey(
        testPassword,
        testUserId
      );

      // Decrypt with recovered private key
      const decrypted = await decryptPatientData(
        encrypted,
        recoveredPrivateKey
      );

      expect(decrypted).toEqual(samplePatientData);
    });

    it("should handle complex patient data", async () => {
      const complexPatientData: PatientPII = {
        firstName: "Müller-Schmidt",
        lastName: "von der Leyen",
        dateOfBirth: "1985-12-31",
        gender: "female",
        additionalInfo: "Additional data with üäöß characters",
        emergencyContact: "+49 123 456789",
      };

      const keys = await generateOrganizationKeys();
      const encrypted = await encryptPatientData(
        complexPatientData,
        keys.publicKey
      );
      const decrypted = await decryptPatientData(encrypted, keys.privateKey);

      expect(decrypted).toEqual(complexPatientData);
    });
  });

  describe("Multi-User Storage Support", () => {
    const user1 = "user-1";
    const user2 = "user-2";
    const user3 = "user-3";
    const password1 = "password123!";
    const password2 = "different456!";

    beforeEach(async () => {
      await deleteAllStoredKeys();
    });

    it("should store keys for multiple users independently", async () => {
      const keys1 = await generateOrganizationKeys();
      const keys2 = await generateOrganizationKeys();
      const keys3 = await generateOrganizationKeys();

      // Store keys for different users
      await storePrivateKey(keys1.privateKey, password1, user1);
      await storePrivateKey(keys2.privateKey, password2, user2);
      await storePrivateKey(keys3.privateKey, password1, user3);

      // All users should have stored keys
      expect(await hasStoredPrivateKey(user1)).toBe(true);
      expect(await hasStoredPrivateKey(user2)).toBe(true);
      expect(await hasStoredPrivateKey(user3)).toBe(true);

      // Load each user's key independently
      const loaded1 = await loadPrivateKey(password1, user1);
      const loaded2 = await loadPrivateKey(password2, user2);
      const loaded3 = await loadPrivateKey(password1, user3);

      expect(loaded1).toBe(keys1.privateKey);
      expect(loaded2).toBe(keys2.privateKey);
      expect(loaded3).toBe(keys3.privateKey);
    });

    it("should list all stored users", async () => {
      const keys = await generateOrganizationKeys();

      // Initially no users
      expect(await listStoredUsers()).toEqual([]);

      // Add users one by one
      await storePrivateKey(keys.privateKey, password1, user1);
      expect(await listStoredUsers()).toEqual([user1]);

      await storePrivateKey(keys.privateKey, password2, user2);
      expect(await listStoredUsers()).toHaveLength(2);
      expect(await listStoredUsers()).toContain(user1);
      expect(await listStoredUsers()).toContain(user2);

      await storePrivateKey(keys.privateKey, password1, user3);
      expect(await listStoredUsers()).toHaveLength(3);
      expect(await listStoredUsers()).toContain(user3);
    });

    it("should get user key info with creation timestamp", async () => {
      const keys = await generateOrganizationKeys();

      // User doesn't exist initially
      const info1 = await getUserKeyInfo(user1);
      expect(info1.exists).toBe(false);
      expect(info1.createdAt).toBeNull();

      // Store key and check info
      await storePrivateKey(keys.privateKey, password1, user1);
      const info2 = await getUserKeyInfo(user1);
      expect(info2.exists).toBe(true);
      expect(info2.createdAt).toBeDefined();
      expect(new Date(info2.createdAt!).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it("should delete individual user keys", async () => {
      const keys = await generateOrganizationKeys();

      // Store keys for multiple users
      await storePrivateKey(keys.privateKey, password1, user1);
      await storePrivateKey(keys.privateKey, password2, user2);
      await storePrivateKey(keys.privateKey, password1, user3);

      expect(await listStoredUsers()).toHaveLength(3);

      // Delete one user's key
      await deleteStoredPrivateKey(user2);

      expect(await hasStoredPrivateKey(user1)).toBe(true);
      expect(await hasStoredPrivateKey(user2)).toBe(false);
      expect(await hasStoredPrivateKey(user3)).toBe(true);

      const remainingUsers = await listStoredUsers();
      expect(remainingUsers).toHaveLength(2);
      expect(remainingUsers).toContain(user1);
      expect(remainingUsers).toContain(user3);
      expect(remainingUsers).not.toContain(user2);
    });

    it("should prevent cross-user key access", async () => {
      const keys1 = await generateOrganizationKeys();
      const keys2 = await generateOrganizationKeys();

      await storePrivateKey(keys1.privateKey, password1, user1);
      await storePrivateKey(keys2.privateKey, password2, user2);

      // User1 cannot load user2's key with user1's password
      await expect(loadPrivateKey(password1, user2)).rejects.toThrow();

      // User2 cannot load user1's key with user2's password
      await expect(loadPrivateKey(password2, user1)).rejects.toThrow();

      // But each user can load their own key
      expect(await loadPrivateKey(password1, user1)).toBe(keys1.privateKey);
      expect(await loadPrivateKey(password2, user2)).toBe(keys2.privateKey);
    });

    it("should delete all stored keys", async () => {
      const keys = await generateOrganizationKeys();

      // Store keys for multiple users
      await storePrivateKey(keys.privateKey, password1, user1);
      await storePrivateKey(keys.privateKey, password2, user2);
      await storePrivateKey(keys.privateKey, password1, user3);

      expect(await listStoredUsers()).toHaveLength(3);

      // Delete all keys
      await deleteAllStoredKeys();

      expect(await listStoredUsers()).toEqual([]);
      expect(await hasStoredPrivateKey(user1)).toBe(false);
      expect(await hasStoredPrivateKey(user2)).toBe(false);
      expect(await hasStoredPrivateKey(user3)).toBe(false);
    });
  });
});
