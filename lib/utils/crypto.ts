import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < KEY_LENGTH) {
    throw new Error("ENCRYPTION_KEY env var must be at least 32 characters");
  }
  return Buffer.from(key.slice(0, KEY_LENGTH), "utf8");
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string: iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/**
 * Decrypts a string previously encrypted with encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const [ivB64, authTagB64, encryptedB64] = ciphertext.split(":");

  if (!ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error("Invalid ciphertext format");
  }

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted) + decipher.final("utf8");
}

/**
 * Returns masked version of passport number for list views.
 * e.g. "A1234567" → "XXXXX567"
 */
export function maskPassportNumber(passportNumber: string): string {
  if (passportNumber.length <= 3) return "XXX";
  const visible = passportNumber.slice(-3);
  return "X".repeat(passportNumber.length - 3) + visible;
}

/**
 * Generates a SHA-256 hash of content (used for policy change detection).
 */
export function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}
