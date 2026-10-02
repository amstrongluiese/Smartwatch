import crypto from 'crypto';
import { config } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

/**
 * Derives a consistent 32-byte Buffer key from the configured encryptionKey.
 */
function getKey(): Buffer {
  return crypto.scryptSync(config.encryptionKey, 'xiaomi_healthkit_salt', 32);
}

/**
 * Encrypts sensitive string data using AES-256-GCM.
 * Output format: base64(iv + authTag + cipherText)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypts AES-256-GCM encrypted base64 string.
 */
export function decrypt(ciphertextBase64: string): string {
  if (!ciphertextBase64) return '';
  const key = getKey();
  const combined = Buffer.from(ciphertextBase64, 'base64');

  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid ciphertext length for AES-GCM decryption');
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Masks sensitive fields (Client Secret, Access Token, Refresh Token, Code)
 * in objects or strings before printing to logs or storing in api_logs.
 */
export function maskSensitive(obj: any): any {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return obj
      .replace(/(client_secret=)([^&]+)/gi, '$1[MASKED_CLIENT_SECRET]')
      .replace(/(access_token=)([^&]+)/gi, '$1[MASKED_ACCESS_TOKEN]')
      .replace(/(refresh_token=)([^&]+)/gi, '$1[MASKED_REFRESH_TOKEN]')
      .replace(/(code=)([^&]+)/gi, '$1[MASKED_AUTH_CODE]');
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(maskSensitive);
    }

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('secret') ||
        lower.includes('access_token') ||
        lower.includes('refresh_token') ||
        lower.includes('authorization') ||
        lower === 'code' ||
        lower === 'token'
      ) {
        cleaned[key] = `[MASKED_${key.toUpperCase()}]`;
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = maskSensitive(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return obj;
}
