import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { assertAllowedFile } from "@/lib/security/file-validate";

// ─── Cloudflare R2 (S3-compatible) ───────────────────────────────────────────

// Trim whitespace/newlines that can sneak in via env var injection
const R2_ACCOUNT_ID      = process.env.R2_ACCOUNT_ID?.trim() ?? "";
const R2_ACCESS_KEY_ID   = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
const R2_BUCKET          = process.env.R2_BUCKET?.trim() ?? "";

const r2Configured =
  !!R2_ACCOUNT_ID &&
  !!R2_ACCESS_KEY_ID &&
  !!R2_SECRET_ACCESS_KEY &&
  !!R2_BUCKET;

const s3 = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

const BUCKET = R2_BUCKET;

// Allowed MIME types for document uploads
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB hard limit

export interface UploadResult {
  fileKey: string;
}

/**
 * Validates and uploads a file buffer to Cloudflare R2.
 * Returns the R2 object key. Never returns a public URL — use getSignedDownloadUrl() for access.
 */
export async function uploadDocument(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string // e.g. "passports/cust_xxx" or "documents/app_xxx"
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed. Accepted: PDF, JPEG, PNG.`);
  }

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds the 5MB limit.`);
  }

  // Verify real content via magic bytes — the client MIME type is spoofable.
  assertAllowedFile(buffer);

  const ext = originalName.split(".").pop() ?? "bin";
  const fileKey = `${folder}/${randomUUID()}.${ext}`;

  if (!r2Configured || !s3) {
    console.warn("[r2] Cloudflare R2 not configured — storing placeholder key:", fileKey);
    return fileKey;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType,
      // R2 does not support ACLs — omit entirely
    })
  );

  return fileKey;
}

/**
 * Generates a pre-signed URL for downloading a document from R2.
 * URL expires after the specified duration (default 15 minutes).
 */
export async function getSignedDownloadUrl(
  fileKey: string,
  expiresInSeconds = 900 // 15 minutes
): Promise<string> {
  if (!r2Configured || !s3) {
    return "";
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes a file from R2.
 */
export async function deleteDocument(fileKey: string): Promise<void> {
  if (!r2Configured || !s3) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    })
  );
}
