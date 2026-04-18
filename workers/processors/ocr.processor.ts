import type { Job } from "bullmq";
import { prisma } from "@/lib/db/prisma";
import { extractPassportData } from "@/lib/services/ocr.service";
import { encrypt } from "@/lib/utils/crypto";
import { getSignedDownloadUrl } from "@/lib/storage/s3";
import type { OcrJobData } from "@/lib/jobs/queue";

const CONFIDENCE_THRESHOLD = 0.75;

export async function processOCRJob(job: Job<OcrJobData>): Promise<void> {
  const { passportId, fileKey } = job.data;
  console.log(`[OCR] Processing passport ${passportId}`);

  const signedUrl = await getSignedDownloadUrl(fileKey, 300);
  const res = await fetch(signedUrl);
  if (!res.ok) throw new Error(`Failed to download passport image: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const ocrResult = await extractPassportData(buffer, contentType);

  const confidenceValues = Object.values(ocrResult.confidence).filter((v) => v > 0);
  const avgConfidence = confidenceValues.length > 0 ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length : 0;

  const update: Record<string, unknown> = { ocrRaw: ocrResult as unknown as object, ocrConfidence: avgConfidence };

  if (ocrResult.fullName && (ocrResult.confidence.fullName ?? 0) >= CONFIDENCE_THRESHOLD) update.fullName = ocrResult.fullName;
  if (ocrResult.passportNumber && (ocrResult.confidence.passportNumber ?? 0) >= CONFIDENCE_THRESHOLD) update.passportNumber = encrypt(ocrResult.passportNumber);
  if (ocrResult.nationality && (ocrResult.confidence.nationality ?? 0) >= CONFIDENCE_THRESHOLD) update.nationality = ocrResult.nationality;
  if (ocrResult.dateOfBirth && (ocrResult.confidence.dateOfBirth ?? 0) >= CONFIDENCE_THRESHOLD) update.dateOfBirth = new Date(ocrResult.dateOfBirth);
  if (ocrResult.expiryDate && (ocrResult.confidence.expiryDate ?? 0) >= CONFIDENCE_THRESHOLD) update.expiryDate = new Date(ocrResult.expiryDate);
  if (ocrResult.gender && (ocrResult.confidence.gender ?? 0) >= CONFIDENCE_THRESHOLD) update.gender = ocrResult.gender;

  await prisma.passport.update({ where: { id: passportId }, data: update });
  console.log(`[OCR] Passport ${passportId} processed. Avg confidence: ${(avgConfidence * 100).toFixed(1)}%`);
}
