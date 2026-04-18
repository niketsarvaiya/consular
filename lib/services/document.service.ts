import { prisma } from "@/lib/db/prisma";
import { uploadDocument, getSignedDownloadUrl } from "@/lib/storage/s3";
import { logAction } from "@/lib/services/audit.service";
import { ocrQueue } from "@/lib/jobs/queue";

export async function uploadChecklistDocument(params: {
  applicationId: string;
  checklistItemId: string;
  customerId: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  fileSize: number;
}) {
  const { applicationId, checklistItemId, customerId } = params;

  // Verify ownership
  const item = await prisma.checklistItem.findFirst({
    where: { id: checklistItemId, applicationId },
  });

  if (!item) throw new Error("Checklist item not found.");

  // Soft-delete previous uploads for this item
  await prisma.document.updateMany({
    where: { checklistItemId, isActive: true },
    data: { isActive: false },
  });

  // Upload to S3
  const folder = `documents/${customerId}/${applicationId}`;
  const fileKey = await uploadDocument(
    params.buffer,
    params.originalName,
    params.mimeType,
    folder
  );

  // Create document record
  const document = await prisma.document.create({
    data: {
      applicationId,
      checklistItemId,
      customerId,
      fileKey,
      fileName: params.originalName,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      isActive: true,
    },
  });

  // Update checklist item status to UPLOADED
  await prisma.checklistItem.update({
    where: { id: checklistItemId },
    data: {
      status: "UPLOADED",
      uploadedAt: new Date(),
      // Reset rejection state on reupload
      rejectionReason: null,
    },
  });

  await logAction({
    actorId: customerId,
    actorType: "customer",
    action: "CREATE",
    resourceType: "document",
    resourceId: document.id,
    newValue: { checklistItemId, fileName: params.originalName },
  });

  return document;
}

export async function uploadPassportDocument(params: {
  customerId: string;
  passportId: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}) {
  const folder = `passports/${params.customerId}`;
  const fileKey = await uploadDocument(
    params.buffer,
    params.originalName,
    params.mimeType,
    folder
  );

  // Update passport with file key
  await prisma.passport.update({
    where: { id: params.passportId },
    data: { frontPageFileKey: fileKey },
  });

  // Enqueue OCR job
  await ocrQueue.add("process", {
    passportId: params.passportId,
    fileKey,
    customerId: params.customerId,
  });

  return { fileKey, ocrQueued: true };
}

/**
 * Returns a list of documents for an application with pre-signed download URLs.
 * URLs expire in 15 minutes.
 */
export async function getApplicationDocuments(
  applicationId: string,
  options?: { activeOnly?: boolean }
) {
  const documents = await prisma.document.findMany({
    where: {
      applicationId,
      ...(options?.activeOnly !== false && { isActive: true }),
    },
    include: {
      checklistItem: { select: { title: true, status: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  // Generate signed URLs for all documents
  const withUrls = await Promise.all(
    documents.map(async (doc) => ({
      ...doc,
      downloadUrl: await getSignedDownloadUrl(doc.fileKey),
    }))
  );

  return withUrls;
}

export async function getPassportDownloadUrl(passportId: string): Promise<string | null> {
  const passport = await prisma.passport.findUnique({
    where: { id: passportId },
    select: { frontPageFileKey: true },
  });

  if (!passport?.frontPageFileKey) return null;
  return getSignedDownloadUrl(passport.frontPageFileKey);
}
