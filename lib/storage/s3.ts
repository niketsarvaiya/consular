import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3Configured =
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY &&
  !!process.env.AWS_S3_BUCKET;

const s3 = s3Configured
  ? new S3Client({
      region: process.env.AWS_REGION ?? "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const BUCKET = process.env.AWS_S3_BUCKET ?? "";

// Allowed MIME types for document uploads
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB hard limit

export interface UploadResult {
  fileKey: string;
  fileUrl: string; // NOT stored in DB — only the key is
}

/**
 * Validates and uploads a file buffer to S3.
 * Returns the S3 key. Never returns a public URL — use getSignedDownloadUrl() for access.
 */
export async function uploadDocument(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string // e.g. "passports/cust_xxx" or "documents/app_xxx"
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed.`);
  }

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum size of 10MB.`);
  }

  const ext = originalName.split(".").pop() ?? "bin";
  const fileKey = `${folder}/${randomUUID()}.${ext}`;

  // If S3 is not configured, store a placeholder key (file won't be retrievable)
  if (!s3Configured || !s3) {
    console.warn("[s3] AWS not configured — storing placeholder key:", fileKey);
    return fileKey;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: "AES256",
      ACL: undefined,
    })
  );

  return fileKey;
}

/**
 * Generates a pre-signed URL for downloading a document.
 * URL expires after the specified duration (default 15 minutes).
 */
export async function getSignedDownloadUrl(
  fileKey: string,
  expiresInSeconds = 900 // 15 minutes
): Promise<string> {
  if (!s3Configured || !s3) {
    return ""; // No S3 — no download URL available
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
  });

  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes a file from S3.
 */
export async function deleteDocument(fileKey: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    })
  );
}
