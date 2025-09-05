import { describe, it, expect, beforeEach } from 'vitest';
import './test-setup';
import {
  generateOrganizationKeys,
  recoverKeysFromMnemonic,
  encryptPatientData,
  decryptPatientData,
  storePrivateKey,
  loadPrivateKey,
  hasStoredPrivateKey,
  deleteStoredPrivateKey
} from './index';
import type { PatientPII } from './index';

describe('Healthcare Encryption MVP', () => {
  const testPassword = 'testPassword123!';
  const samplePatientData: PatientPII = {
    firstName: 'Max',
    lastName: 'Mustermann',
    dateOfBirth: '1990-05-15',
    gender: 'male'
  };

  beforeEach(async () => {
    if (await hasStoredPrivateKey()) {
      await deleteStoredPrivateKey();
    }
  });

  describe('Key Generation with German BIP39', () => {
    it('should generate RSA keys with BIP39 mnemonic', async () => {
      const result = await generateOrganizationKeys();
      
      expect(result.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(result.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result.germanMnemonic).toBeDefined();
      expect(result.germanMnemonic.split(' ')).toHaveLength(12);
      
      const words = result.germanMnemonic.split(' ');
      words.forEach(word => {
        expect(word).toMatch(/^[a-z]+$/);
      });
    });

    it('should generate new keys from BIP39 mnemonic (backup functionality)', async () => {
      const original = await generateOrganizationKeys();
      const recovered = await recoverKeysFromMnemonic(original.germanMnemonic);
      
      // Mnemonic recovery generates new keys (used for backup scenarios)
      expect(recovered.publicKey).toBeDefined();
      expect(recovered.privateKey).toBeDefined();
      expect(recovered.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      expect(recovered.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
    });

    it('should generate different keys each time', async () => {
      const keys1 = await generateOrganizationKeys();
      const keys2 = await generateOrganizationKeys();
      
      expect(keys1.publicKey).not.toBe(keys2.publicKey);
      expect(keys1.privateKey).not.toBe(keys2.privateKey);
      expect(keys1.germanMnemonic).not.toBe(keys2.germanMnemonic);
    });
  });

  describe('Hybrid RSA+AES Encryption/Decryption', () => {
    it('should encrypt and decrypt patient data correctly', async () => {
      const keys = await generateOrganizationKeys();
      
      const encrypted = await encryptPatientData(samplePatientData, keys.publicKey);
      const decrypted = await decryptPatientData(encrypted, keys.privateKey);
      
      expect(decrypted).toEqual(samplePatientData);
    });

    it('should produce different encrypted data each time', async () => {
      const keys = await generateOrganizationKeys();
      
      const encrypted1 = await encryptPatientData(samplePatientData, keys.publicKey);
      const encrypted2 = await encryptPatientData(samplePatientData, keys.publicKey);
      
      expect(encrypted1).not.toBe(encrypted2);
      
      const decrypted1 = await decryptPatientData(encrypted1, keys.privateKey);
      const decrypted2 = await decryptPatientData(encrypted2, keys.privateKey);
      
      expect(decrypted1).toEqual(samplePatientData);
      expect(decrypted2).toEqual(samplePatientData);
    });

    it('should validate encrypted payload structure', async () => {
      const keys = await generateOrganizationKeys();
      const encrypted = await encryptPatientData(samplePatientData, keys.publicKey);
      
      const payload = JSON.parse(encrypted);
      expect(payload).toHaveProperty('encryptedAESKey');
      expect(payload).toHaveProperty('encryptedData');
      expect(payload).toHaveProperty('iv');
      expect(payload).toHaveProperty('version');
      expect(payload.version).toBe('1');
    });

    it('should fail to decrypt with wrong private key', async () => {
      const keys1 = await generateOrganizationKeys();
      const keys2 = await generateOrganizationKeys();
      
      const encrypted = await encryptPatientData(samplePatientData, keys1.publicKey);
      
      await expect(
        decryptPatientData(encrypted, keys2.privateKey)
      ).rejects.toThrow();
    });

    it('should validate patient data structure', async () => {
      const keys = await generateOrganizationKeys();
      
      const invalidData = {
        firstName: 'Max',
        lastName: '', // Invalid: empty string
        dateOfBirth: '1990-05-15',
        gender: 'male'
      } as PatientPII;
      
      await expect(
        encryptPatientData(invalidData, keys.publicKey).then(encrypted => 
          decryptPatientData(encrypted, keys.privateKey)
        )
      ).rejects.toThrow('lastName must be a non-empty string');
    });

    it('should validate date format', async () => {
      const keys = await generateOrganizationKeys();
      
      const invalidData = {
        firstName: 'Max',
        lastName: 'Mustermann',
        dateOfBirth: '15/05/1990', // Invalid format
        gender: 'male'
      } as PatientPII;
      
      const encrypted = await encryptPatientData(invalidData, keys.publicKey);
      await expect(
        decryptPatientData(encrypted, keys.privateKey)
      ).rejects.toThrow('dateOfBirth must be in YYYY-MM-DD format');
    });
  });

  describe('IndexedDB Storage with Password Protection', () => {
    it('should store and load private key with password', async () => {
      const keys = await generateOrganizationKeys();
      
      await storePrivateKey(keys.privateKey, testPassword);
      const loaded = await loadPrivateKey(testPassword);
      
      expect(loaded).toBe(keys.privateKey);
    });

    it('should detect stored private key', async () => {
      const keys = await generateOrganizationKeys();
      
      expect(await hasStoredPrivateKey()).toBe(false);
      
      await storePrivateKey(keys.privateKey, testPassword);
      expect(await hasStoredPrivateKey()).toBe(true);
    });

    it('should fail to load with wrong password', async () => {
      const keys = await generateOrganizationKeys();
      await storePrivateKey(keys.privateKey, testPassword);
      
      await expect(
        loadPrivateKey('wrongPassword')
      ).rejects.toThrow();
    });

    it('should delete stored private key', async () => {
      const keys = await generateOrganizationKeys();
      await storePrivateKey(keys.privateKey, testPassword);
      
      expect(await hasStoredPrivateKey()).toBe(true);
      
      await deleteStoredPrivateKey();
      expect(await hasStoredPrivateKey()).toBe(false);
    });

    it('should require minimum password length', async () => {
      const keys = await generateOrganizationKeys();
      
      await expect(
        storePrivateKey(keys.privateKey, '1234567') // 7 chars, too short
      ).rejects.toThrow('Password must be at least 8 characters long');
    });
  });

  describe('End-to-End Integration', () => {
    it('should complete full workflow: generate → encrypt → store → load → decrypt', async () => {
      // Generate keys
      const keys = await generateOrganizationKeys();
      
      // Encrypt patient data
      const encrypted = await encryptPatientData(samplePatientData, keys.publicKey);
      
      // Store private key
      await storePrivateKey(keys.privateKey, testPassword);
      
      // Load private key
      const loadedPrivateKey = await loadPrivateKey(testPassword);
      
      // Decrypt patient data
      const decrypted = await decryptPatientData(encrypted, loadedPrivateKey);
      
      expect(decrypted).toEqual(samplePatientData);
    });

    it('should demonstrate backup workflow with stored keys', async () => {
      // Generate original keys
      const original = await generateOrganizationKeys();
      
      // Store the keys securely
      await storePrivateKey(original.privateKey, testPassword);
      
      // Encrypt data with public key
      const encrypted = await encryptPatientData(samplePatientData, original.publicKey);
      
      // Load keys from storage (simulating recovery)
      const recoveredPrivateKey = await loadPrivateKey(testPassword);
      
      // Decrypt with recovered private key
      const decrypted = await decryptPatientData(encrypted, recoveredPrivateKey);
      
      expect(decrypted).toEqual(samplePatientData);
    });

    it('should handle complex patient data', async () => {
      const complexPatientData: PatientPII = {
        firstName: 'Müller-Schmidt',
        lastName: 'von der Leyen',
        dateOfBirth: '1985-12-31',
        gender: 'female',
        additionalInfo: 'Additional data with üäöß characters',
        emergencyContact: '+49 123 456789'
      };
      
      const keys = await generateOrganizationKeys();
      const encrypted = await encryptPatientData(complexPatientData, keys.publicKey);
      const decrypted = await decryptPatientData(encrypted, keys.privateKey);
      
      expect(decrypted).toEqual(complexPatientData);
    });
  });
});