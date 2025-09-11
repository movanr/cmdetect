# Crypto Module

Healthcare patient data encryption using ECDSA P-256 + ECIES.

## Architecture

- **Keys**: ECDSA P-256 with BIP39 12-word recovery phrases
- **Encryption**: ECIES (ECDH + AES-256-GCM) with ephemeral keys
- **Storage**: Plain text in IndexedDB (browser-sandboxed)
- **Libraries**: `@noble/curves`, `@scure/bip39`

## Usage

```typescript
// Generate keys with recovery phrase
const { publicKey, privateKey, englishMnemonic } = await generateOrganizationKeys();
await storePrivateKey(privateKey);

// Recover from mnemonic
const { publicKey, privateKey } = await recoverKeysFromMnemonic(mnemonic);

// Encrypt/decrypt patient data
const encrypted = await encryptPatientData(patientData, publicKey);
const privateKey = await loadPrivateKey();
const decrypted = await decryptPatientData(encrypted, privateKey);
```

## Security

- **BIP39 mnemonic** provides complete key recovery
- **Ephemeral keys** ensure forward secrecy per encryption
- **Browser isolation** protects stored keys
- **ECIES** provides authenticated encryption with tamper detection

## Files

- `keyGeneration.ts` - ECDSA + BIP39 key handling
- `encryption.ts` - ECIES encrypt/decrypt implementation  
- `storage.ts` - IndexedDB key storage
- `types.ts` - TypeScript interfaces and constants