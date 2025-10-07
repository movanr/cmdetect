/**
 * Parses a public key from PEM format to raw bytes.
 * Used to parse the organization's public key received from the server.
 *
 * @param publicKeyPem - Public key in PEM format
 * @returns Raw public key bytes
 */
export function parsePublicKeyFromPem(publicKeyPem: string): Uint8Array {
  const keyData = publicKeyPem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "");

  return new Uint8Array(base64ToArrayBuffer(keyData));
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
