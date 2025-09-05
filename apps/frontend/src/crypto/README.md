# Crypto Module

Healthcare patient data encryption using ECDSA P-256 + ECIES.

## Architecture

- **Keys**: ECDSA P-256 with BIP39 12-word recovery phrases
- **Encryption**: ECIES (ECDH + AES-256-GCM) 
- **Storage**: Password-protected IndexedDB
- **Libraries**: `@noble/curves`, `@scure/bip39`

## Usage

### Organization Setup
```typescript
// Generate new keys with backup phrase
const { publicKey, privateKey, englishMnemonic } = await generateOrganizationKeys();
await storePrivateKey(privateKey, password);
```

### Device Recovery  
```typescript
// Recover from 12-word phrase
const { publicKey, privateKey } = await recoverKeysFromMnemonic(mnemonic);
await storePrivateKey(privateKey, password);
```

### Encrypt/Decrypt Data
```typescript
// Encrypt patient data
const encrypted = await encryptPatientData(patientData, publicKey);

// Decrypt patient data
const privateKey = await loadPrivateKey(password);
const decrypted = await decryptPatientData(encrypted, privateKey);
```

## Key Features

- ✅ **Deterministic recovery**: Same mnemonic = same keys
- ✅ **Cross-device compatible**: Keys work identically everywhere
- ✅ **Semantic security**: Same data → different ciphertext each time
- ✅ **Authenticated encryption**: Tamper detection built-in
- ✅ **26 comprehensive tests**: All edge cases covered

## Security

- **Mnemonic phrases** provide complete backup capability
- **ECIES encryption** ensures forward secrecy with ephemeral keys
- **Password storage** uses PBKDF2 (100k iterations) + AES-GCM
- **Input validation** prevents malformed data attacks

## Files

- `index.ts` - Public API exports
- `keyGeneration.ts` - ECDSA + BIP39 key handling
- `encryption.ts` - ECIES encrypt/decrypt implementation  
- `storage.ts` - IndexedDB password-protected storage
- `types.ts` - TypeScript interfaces and constants
- `crypto.test.ts` - Test suite (run: `npm test -- crypto.test.ts`)