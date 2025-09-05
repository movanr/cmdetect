import { 
  CRYPTO_ALGORITHMS, 
  CRYPTO_CONSTANTS
} from './types';
import type { 
  PatientPII, 
  EncryptedPayload,
  CryptoError
} from './types';
import { importPublicKeyFromPem, importPrivateKeyFromPem } from './keyGeneration';

export async function encryptPatientData(
  patientData: PatientPII, 
  publicKeyPem: string
): Promise<string> {
  try {
    const aesKey = await crypto.subtle.generateKey(
      {
        name: CRYPTO_ALGORITHMS.AES.name,
        length: CRYPTO_ALGORITHMS.AES.length
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(CRYPTO_CONSTANTS.AES_IV_SIZE));
    
    const patientDataString = JSON.stringify(patientData);
    const patientDataBuffer = new TextEncoder().encode(patientDataString);
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: CRYPTO_ALGORITHMS.AES.name,
        iv: iv
      },
      aesKey,
      patientDataBuffer
    );
    
    const exportedAESKey = await crypto.subtle.exportKey('raw', aesKey);
    
    const publicKey = await importPublicKeyFromPem(publicKeyPem);
    
    const encryptedAESKey = await crypto.subtle.encrypt(
      {
        name: CRYPTO_ALGORITHMS.RSA.name
      },
      publicKey,
      exportedAESKey
    );
    
    const payload: EncryptedPayload = {
      encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
      encryptedData: arrayBufferToBase64(encryptedData),
      iv: arrayBufferToBase64(iv),
      version: CRYPTO_CONSTANTS.ENCRYPTION_VERSION
    };
    
    return JSON.stringify(payload);
    
  } catch (error) {
    const cryptoError: CryptoError = {
      name: 'EncryptionError',
      message: `Failed to encrypt patient data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'ENCRYPTION_FAILED'
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
    
    const privateKey = await importPrivateKeyFromPem(privateKeyPem);
    
    const encryptedAESKeyBuffer = base64ToArrayBuffer(payload.encryptedAESKey);
    const decryptedAESKeyBuffer = await crypto.subtle.decrypt(
      {
        name: CRYPTO_ALGORITHMS.RSA.name
      },
      privateKey,
      encryptedAESKeyBuffer
    );
    
    const aesKey = await crypto.subtle.importKey(
      'raw',
      decryptedAESKeyBuffer,
      {
        name: CRYPTO_ALGORITHMS.AES.name
      },
      false,
      ['decrypt']
    );
    
    const encryptedPatientDataBuffer = base64ToArrayBuffer(payload.encryptedData);
    const ivBuffer = base64ToArrayBuffer(payload.iv);
    
    const decryptedPatientDataBuffer = await crypto.subtle.decrypt(
      {
        name: CRYPTO_ALGORITHMS.AES.name,
        iv: ivBuffer
      },
      aesKey,
      encryptedPatientDataBuffer
    );
    
    const decryptedPatientDataString = new TextDecoder().decode(decryptedPatientDataBuffer);
    const patientData: PatientPII = JSON.parse(decryptedPatientDataString);
    
    validatePatientPII(patientData);
    
    return patientData;
    
  } catch (error) {
    const cryptoError: CryptoError = {
      name: 'DecryptionError',
      message: `Failed to decrypt patient data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'DECRYPTION_FAILED'
    };
    throw cryptoError;
  }
}

function validatePatientPII(data: any): asserts data is PatientPII {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid patient data: must be an object');
  }
  
  const required = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
  for (const field of required) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      throw new Error(`Invalid patient data: ${field} must be a non-empty string`);
    }
  }
  
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(data.dateOfBirth)) {
    throw new Error('Invalid patient data: dateOfBirth must be in YYYY-MM-DD format');
  }
  
  const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
  if (!validGenders.includes(data.gender.toLowerCase())) {
    throw new Error(`Invalid patient data: gender must be one of ${validGenders.join(', ')}`);
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
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