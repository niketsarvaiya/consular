import { prisma } from "@/lib/db/prisma";
import { uploadDocument, getSignedDownloadUrl, deleteDocument } from "@/lib/storage/s3";
import { logAction } from "@/lib/services/audit.service";
import { enqueueNotification } from "@/lib/services/notification.service";

/**
 * Ops uploads the final visa document received from the embassy and attaches it
 * to the application. Replaces any previously uploaded visa file.
 */
export async function uploadVisaDocument(params: {
  applicationId: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  opsUserId: string;
}) {
  const app = await prisma.application.findUnique({
    where: { id: params.applicationId },
    include: {
      customer: { select: { id: true, email: true, fullName: true } },
      country: { select: { name: true } },
    },
  });
  if (!app) throw new Error("Application not found.");

  // Remove the previous visa file if replacing.
  if (app.visaFileKey) await deleteDocument(app.visaFileKey).catch(() => {});

  const fileKey = await uploadDocument(
    params.buffer,
    params.originalName,
    params.mimeType,
    `visas/${params.applicationId}`
  );

  await prisma.application.update({
    where: { id: params.applicationId },
    data: { visaFileKey: fileKey, visaFileName: params.originalName, visaIssuedAt: new Date() },
  });

  await logAction({
    actorType: "ops_user",
    actorId: params.opsUserId,
    action: "CREATE",
    resourceType: "application",
    resourceId: params.applicationId,
    newValue: { visaFileName: params.originalName },
  }).catch(() => {});

  if (app.customer) {
    await enqueueNotification({
      eventType: "visa_issued",
      customerId: app.customer.id,
      applicationId: params.applicationId,
      channel: "EMAIL",
      recipient: app.customer.email,
      templateVars: { customerName: app.customer.fullName, country: app.country.name },
    }).catch(() => {});
  }

  return { fileKey };
}

/**
 * Returns a short-lived signed URL for the issued visa document.
 * Pass customerId to enforce ownership (customer-facing); omit for ops.
 */
export async function getVisaDownloadUrl(applicationId: string, customerId?: string) {
  const app = await prisma.application.findFirst({
    where: { id: applicationId, ...(customerId && { customerId }) },
    select: { visaFileKey: true, visaFileName: true, visaIssuedAt: true },
  });
  if (!app?.visaFileKey) return null;
  const url = await getSignedDownloadUrl(app.visaFileKey);
  return { url, fileName: app.visaFileName, issuedAt: app.visaIssuedAt };
}
