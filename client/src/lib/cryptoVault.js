/**
 * MindVault AI — Client-Side Zero-Knowledge Encryption
 * Uses native Web Crypto API (AES-256-GCM + PBKDF2)
 * Data is encrypted in the browser BEFORE reaching the network or Firestore.
 */

const ITERATIONS = 100000;

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt plaintext using AES-256-GCM with a user-provided passphrase.
 */
export async function encryptVaultText(plaintext, passphrase) {
  if (!plaintext || !passphrase) return plaintext;

  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    enc.encode(plaintext)
  );

  return JSON.stringify({
    zk_encrypted: true,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(encryptedBuffer),
  });
}

/**
 * Decrypt AES-256-GCM payload with user passphrase.
 */
export async function decryptVaultText(encryptedPayload, passphrase) {
  if (!encryptedPayload || !passphrase) return encryptedPayload;

  try {
    const data = typeof encryptedPayload === 'string' ? JSON.parse(encryptedPayload) : encryptedPayload;
    if (!data.zk_encrypted) return encryptedPayload;

    const salt = new Uint8Array(base64ToBuffer(data.salt));
    const iv = new Uint8Array(base64ToBuffer(data.iv));
    const ciphertext = base64ToBuffer(data.ciphertext);
    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (err) {
    throw new Error('Incorrect vault passphrase or corrupted cipher payload.');
  }
}
