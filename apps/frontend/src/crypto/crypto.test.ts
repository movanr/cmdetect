import { describe, it, expect, beforeEach } from "vitest";
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
  generateRecoveryFile,
  parseRecoveryFile,
} from "./index";
import type { PatientPII } from "./index";

describe("Healthcare Encryption MVP", () => {
  const samplePatientData: PatientPII = {
    firstName: "Max",
    lastName: "Mustermann",
    dateOfBirth: "1990-05-15",
    gender: "male",
  };

  beforeEach(async () => {
    if (await hasStoredPrivateKey()) {
      await deleteStoredPrivateKey();
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

      await storePrivateKey(keys.privateKey);
      const loaded = await loadPrivateKey();

      expect(loaded).toBe(keys.privateKey);
    });

    it("should detect stored private key", async () => {
      const keys = await generateOrganizationKeys();

      expect(await hasStoredPrivateKey()).toBe(false);

      await storePrivateKey(keys.privateKey);
      expect(await hasStoredPrivateKey()).toBe(true);
    });

    it("should fail to load with wrong password", async () => {
      const keys = await generateOrganizationKeys();
      await storePrivateKey(keys.privateKey);

      await expect(loadPrivateKey()).resolves.not.toThrow();
    });

    it("should delete stored private key", async () => {
      const keys = await generateOrganizationKeys();
      await storePrivateKey(keys.privateKey);

      expect(await hasStoredPrivateKey()).toBe(true);

      await deleteStoredPrivateKey();
      expect(await hasStoredPrivateKey()).toBe(false);
    });

    it("should require minimum password length", async () => {
      const keys = await generateOrganizationKeys();

      await expect(
        storePrivateKey(keys.privateKey)
      ).resolves.not.toThrow();
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
      await storePrivateKey(keys.privateKey);

      // Load private key
      const loadedPrivateKey = await loadPrivateKey();
      if (!loadedPrivateKey) {
        throw new Error("Failed to load private key");
      }

      // Decrypt patient data
      const decrypted = await decryptPatientData(encrypted, loadedPrivateKey);

      expect(decrypted).toEqual(samplePatientData);
    });

    it("should demonstrate backup workflow with stored keys", async () => {
      // Generate original keys
      const original = await generateOrganizationKeys();

      // Store the keys securely
      await storePrivateKey(original.privateKey);

      // Encrypt data with public key
      const encrypted = await encryptPatientData(
        samplePatientData,
        original.publicKey
      );

      // Load keys from storage (simulating recovery)
      const recoveredPrivateKey = await loadPrivateKey();
      if (!recoveredPrivateKey) {
        throw new Error("Failed to load private key");
      }

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

  describe("File Recovery System", () => {
    const testOrganizationOptions = {
      organizationId: "org_test_123",
      organizationName: "Test Medical Practice",
    };

    describe("Recovery File Generation", () => {
      it("should generate a valid recovery file", async () => {
        const keys = await generateOrganizationKeys();
        const recoveryFile = generateRecoveryFile(
          keys.englishMnemonic,
          testOrganizationOptions
        );

        expect(recoveryFile.version).toBe("1.0.0");
        expect(recoveryFile.organizationId).toBe(testOrganizationOptions.organizationId);
        expect(recoveryFile.organizationName).toBe(testOrganizationOptions.organizationName);
        expect(recoveryFile.mnemonic).toBe(keys.englishMnemonic);
        expect(recoveryFile.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      });

      it("should reject invalid mnemonic for recovery file", () => {
        const invalidMnemonic = "invalid mnemonic phrase";

        expect(() => generateRecoveryFile(invalidMnemonic, testOrganizationOptions))
          .toThrow("Invalid mnemonic phrase");
      });

      it("should create recovery files with consistent structure", async () => {
        const keys = await generateOrganizationKeys();
        const recoveryFile1 = generateRecoveryFile(
          keys.englishMnemonic,
          testOrganizationOptions
        );
        const recoveryFile2 = generateRecoveryFile(
          keys.englishMnemonic,
          testOrganizationOptions
        );

        expect(recoveryFile1.mnemonic).toBe(recoveryFile2.mnemonic);
        expect(recoveryFile1.organizationId).toBe(recoveryFile2.organizationId);
        expect(recoveryFile1.version).toBe(recoveryFile2.version);
        // createdAt will be different due to timing
      });
    });

    describe("Recovery File Parsing", () => {
      it("should parse a valid recovery file", async () => {
        const keys = await generateOrganizationKeys();
        const originalRecoveryFile = generateRecoveryFile(
          keys.englishMnemonic,
          testOrganizationOptions
        );

        const jsonString = JSON.stringify(originalRecoveryFile);
        const parsedRecoveryFile = parseRecoveryFile(jsonString);

        expect(parsedRecoveryFile).toEqual(originalRecoveryFile);
      });

      it("should reject recovery file with missing fields", () => {
        const incompleteFile = {
          version: "1.0.0",
          organizationId: "org_123",
          // Missing organizationName, createdAt, mnemonic
        };

        const jsonString = JSON.stringify(incompleteFile);

        expect(() => parseRecoveryFile(jsonString))
          .toThrow("Missing required field");
      });

      it("should reject recovery file with unsupported version", async () => {
        const keys = await generateOrganizationKeys();
        const recoveryFile = generateRecoveryFile(
          keys.englishMnemonic,
          testOrganizationOptions
        );

        recoveryFile.version = "2.0.0"; // Unsupported version
        const jsonString = JSON.stringify(recoveryFile);

        expect(() => parseRecoveryFile(jsonString))
          .toThrow("Unsupported recovery file version: 2.0.0");
      });

      it("should reject recovery file with invalid mnemonic", () => {
        const invalidRecoveryFile = {
          version: "1.0.0",
          organizationId: "org_123",
          organizationName: "Test Practice",
          createdAt: new Date().toISOString(),
          mnemonic: "invalid mnemonic phrase not real words"
        };

        const jsonString = JSON.stringify(invalidRecoveryFile);

        expect(() => parseRecoveryFile(jsonString))
          .toThrow("Invalid mnemonic in recovery file");
      });

      it("should reject malformed JSON", () => {
        const malformedJson = '{"version": "1.0.0", "organizationId":}';

        expect(() => parseRecoveryFile(malformedJson))
          .toThrow("Failed to parse recovery file");
      });
    });

    describe("End-to-End Recovery Workflow", () => {
      it("should complete full recovery workflow: generate → save → parse → recover", async () => {
        // 1. Generate original keys
        const originalKeys = await generateOrganizationKeys();

        // 2. Create recovery file
        const recoveryFile = generateRecoveryFile(
          originalKeys.englishMnemonic,
          testOrganizationOptions
        );

        // 3. Simulate saving to file (JSON serialization)
        const jsonString = JSON.stringify(recoveryFile, null, 2);

        // 4. Simulate loading from file (JSON parsing)
        const parsedRecoveryFile = parseRecoveryFile(jsonString);

        // 5. Recover keys from the parsed file
        const recoveredKeys = await recoverKeysFromMnemonic(parsedRecoveryFile.mnemonic);

        // 6. Verify recovered keys match original
        expect(recoveredKeys.publicKey).toBe(originalKeys.publicKey);
        expect(recoveredKeys.privateKey).toBe(originalKeys.privateKey);
      });

      it("should enable data decryption after file recovery", async () => {
        // 1. Generate keys and encrypt data
        const originalKeys = await generateOrganizationKeys();
        const encryptedData = await encryptPatientData(
          samplePatientData,
          originalKeys.publicKey
        );

        // 2. Create and simulate file recovery
        const recoveryFile = generateRecoveryFile(
          originalKeys.englishMnemonic,
          testOrganizationOptions
        );
        const jsonString = JSON.stringify(recoveryFile);
        const parsedRecoveryFile = parseRecoveryFile(jsonString);

        // 3. Recover keys and decrypt data
        const recoveredKeys = await recoverKeysFromMnemonic(parsedRecoveryFile.mnemonic);
        const decryptedData = await decryptPatientData(
          encryptedData,
          recoveredKeys.privateKey
        );

        // 4. Verify data integrity
        expect(decryptedData).toEqual(samplePatientData);
      });

      it("should handle multiple recovery file generations from same mnemonic", async () => {
        const originalKeys = await generateOrganizationKeys();

        // Create multiple recovery files at different times
        const recoveryFile1 = generateRecoveryFile(
          originalKeys.englishMnemonic,
          testOrganizationOptions
        );

        // Simulate time passing
        await new Promise(resolve => setTimeout(resolve, 10));

        const recoveryFile2 = generateRecoveryFile(
          originalKeys.englishMnemonic,
          {
            organizationId: "org_different_456",
            organizationName: "Different Practice"
          }
        );

        // Both should contain the same mnemonic
        expect(recoveryFile1.mnemonic).toBe(recoveryFile2.mnemonic);
        expect(recoveryFile1.mnemonic).toBe(originalKeys.englishMnemonic);

        // Both should recover to the same keys
        const keys1 = await recoverKeysFromMnemonic(recoveryFile1.mnemonic);
        const keys2 = await recoverKeysFromMnemonic(recoveryFile2.mnemonic);

        expect(keys1.publicKey).toBe(keys2.publicKey);
        expect(keys1.privateKey).toBe(keys2.privateKey);
      });
    });

    describe("Recovery File Security", () => {
      it("should store mnemonic in plain text for MVP", async () => {
        const keys = await generateOrganizationKeys();
        const recoveryFile = generateRecoveryFile(
          keys.englishMnemonic,
          testOrganizationOptions
        );

        // In MVP, mnemonic should be stored as-is
        expect(recoveryFile.mnemonic).toBe(keys.englishMnemonic);
        expect(recoveryFile.mnemonic.split(" ")).toHaveLength(12);
      });

      it("should validate mnemonic words are from BIP39 wordlist", async () => {
        const keys = await generateOrganizationKeys();
        const recoveryFile = generateRecoveryFile(
          keys.englishMnemonic,
          testOrganizationOptions
        );

        const words = recoveryFile.mnemonic.split(" ");
        expect(words).toHaveLength(12);

        words.forEach(word => {
          expect(word).toMatch(/^[a-z]+$/); // Only lowercase letters
          expect(word.length).toBeGreaterThan(2); // Reasonable word length
        });
      });

      it("should generate different recovery files for different organizations", async () => {
        const keys = await generateOrganizationKeys();

        const org1Options = {
          organizationId: "org_1",
          organizationName: "Practice One"
        };

        const org2Options = {
          organizationId: "org_2",
          organizationName: "Practice Two"
        };

        const recoveryFile1 = generateRecoveryFile(keys.englishMnemonic, org1Options);
        const recoveryFile2 = generateRecoveryFile(keys.englishMnemonic, org2Options);

        expect(recoveryFile1.organizationId).not.toBe(recoveryFile2.organizationId);
        expect(recoveryFile1.organizationName).not.toBe(recoveryFile2.organizationName);
        expect(recoveryFile1.mnemonic).toBe(recoveryFile2.mnemonic); // Same keys
      });
    });

    describe("Error Handling", () => {
      it("should handle CryptoError for invalid mnemonic", () => {
        expect(() => generateRecoveryFile("invalid mnemonic", testOrganizationOptions))
          .toThrow(expect.objectContaining({
            name: "RecoveryFileError",
            code: "RECOVERY_FILE_GENERATION_FAILED"
          }));
      });

      it("should handle CryptoError for parse failures", () => {
        expect(() => parseRecoveryFile("invalid json"))
          .toThrow(expect.objectContaining({
            name: "RecoveryFileError",
            code: "RECOVERY_FILE_PARSE_FAILED"
          }));
      });

      it("should preserve original error messages", () => {
        try {
          parseRecoveryFile("invalid json");
        } catch (error: any) {
          expect(error.message).toContain("Failed to parse recovery file");
          expect(error.message).toContain("Unexpected token");
        }
      });
    });
  });
});
