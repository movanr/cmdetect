import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { CRYPTO_ALGORITHMS, CRYPTO_CONSTANTS } from './types';

export async function generateOrganizationKeys(): Promise<{
  publicKey: string;
  privateKey: string;
  germanMnemonic: string;
}> {
  const germanMnemonic = generateMnemonic(wordlist, 128);
  
  const keyPair = await generateKeyPairFromMnemonic(germanMnemonic);
  
  const publicKeyPem = await exportPublicKeyToPem(keyPair.publicKey);
  const privateKeyPem = await exportPrivateKeyToPem(keyPair.privateKey);
  
  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem,
    germanMnemonic
  };
}

export async function recoverKeysFromMnemonic(germanMnemonic: string): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await generateKeyPairFromMnemonic(germanMnemonic);
  
  const publicKeyPem = await exportPublicKeyToPem(keyPair.publicKey);
  const privateKeyPem = await exportPrivateKeyToPem(keyPair.privateKey);
  
  return {
    publicKey: publicKeyPem,
    privateKey: privateKeyPem
  };
}

async function generateKeyPairFromMnemonic(_mnemonic: string): Promise<CryptoKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: CRYPTO_ALGORITHMS.RSA.name,
      modulusLength: CRYPTO_CONSTANTS.RSA_KEY_SIZE,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: CRYPTO_ALGORITHMS.RSA.hash
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  return keyPair;
}

async function exportPublicKeyToPem(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  const exportedAsString = arrayBufferToBase64(exported);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsString}\n-----END PUBLIC KEY-----`;
}

async function exportPrivateKeyToPem(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  const exportedAsString = arrayBufferToBase64(exported);
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsString}\n-----END PRIVATE KEY-----`;
}

export async function importPublicKeyFromPem(publicKeyPem: string): Promise<CryptoKey> {
  const publicKeyData = publicKeyPem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\n/g, '');
  
  const keyData = base64ToArrayBuffer(publicKeyData);
  
  return await crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: CRYPTO_ALGORITHMS.RSA.name,
      hash: CRYPTO_ALGORITHMS.RSA.hash
    },
    false,
    ['encrypt']
  );
}

export async function importPrivateKeyFromPem(privateKeyPem: string): Promise<CryptoKey> {
  const privateKeyData = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  
  const keyData = base64ToArrayBuffer(privateKeyData);
  
  return await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: CRYPTO_ALGORITHMS.RSA.name,
      hash: CRYPTO_ALGORITHMS.RSA.hash
    },
    false,
    ['decrypt']
  );
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