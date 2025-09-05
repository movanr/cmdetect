# Healthcare Encryption MVP

A TypeScript implementation of end-to-end encryption for healthcare patient PII using hybrid RSA+AES encryption with BIP39 mnemonic backup.

## Features

- **Hybrid Encryption**: RSA-2048 for key exchange, AES-256-GCM for data encryption
- **Organization Keypairs**: Each healthcare organization gets unique RSA keypairs
- **BIP39 Mnemonic**: 12-word backup phrase for key recovery (English wordlist)
- **Secure Storage**: IndexedDB storage with password-protected private keys
- **Browser Native**: Uses WebCrypto API for all cryptographic operations

## Usage

### Key Generation

```typescript
import { generateOrganizationKeys } from './crypto';

// Generate new organization keypair with mnemonic backup
const keys = await generateOrganizationKeys();
console.log('Public Key:', keys.publicKey);
console.log('Mnemonic:', keys.germanMnemonic);

// Store private key securely
await storePrivateKey(keys.privateKey, 'strong-password');
```

### Patient Data Encryption

```typescript
import { encryptPatientData, decryptPatientData } from './crypto';

const patientData = {
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-05-15',
  gender: 'male'
};

// Encrypt on patient device (using organization's public key)
const encryptedData = await encryptPatientData(patientData, publicKey);

// Decrypt on organization device (using private key)
const decryptedData = await decryptPatientData(encryptedData, privateKey);
```

### Key Storage & Recovery

```typescript
import { 
  storePrivateKey, 
  loadPrivateKey, 
  hasStoredPrivateKey,
  recoverKeysFromMnemonic 
} from './crypto';

// Store private key with password protection
await storePrivateKey(privateKey, 'password123');

// Check if key exists
const hasKey = await hasStoredPrivateKey();

// Load private key
const privateKey = await loadPrivateKey('password123');

// Generate new keys from mnemonic (backup scenario)
const newKeys = await recoverKeysFromMnemonic(mnemonic);
```

## Security Features

- **Never logs sensitive data**: Private keys and decrypted patient data are never logged
- **Input validation**: All patient data is validated before encryption/decryption
- **Password requirements**: Minimum 8-character passwords for key storage
- **Error handling**: Comprehensive error types for different failure scenarios

## Encrypted Payload Format

```json
{
  "encryptedAESKey": "base64-rsa-encrypted-aes-key",
  "encryptedData": "base64-aes-encrypted-patient-data",
  "iv": "base64-initialization-vector",
  "version": "1"
}
```

## Error Types

- `EncryptionError`: Failed to encrypt patient data
- `DecryptionError`: Failed to decrypt patient data  
- `StorageError`: IndexedDB storage/retrieval failures
- Input validation errors for invalid patient data

## Browser Compatibility

Requires modern browsers with WebCrypto API support:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 79+

## Testing

```bash
pnpm test crypto.test.ts
```

The test suite covers:
- Key generation and BIP39 mnemonic creation
- Hybrid RSA+AES encryption/decryption
- IndexedDB storage with password protection
- End-to-end integration workflows
- Input validation and error handling