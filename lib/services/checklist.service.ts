import { prisma } from "@/lib/db/prisma";
import type { DocumentTemplate } from "@/types";
import type { ChecklistItemStatus } from "@prisma/client";

/**
 * Generates checklist items for an application based on the active policy.
 * Called immediately after application creation.
 */
export async function generateChecklist(
  applicationId: string,
  policyId: string
): Promise<void> {
  const [application, policy] = await Promise.all([
    prisma.application.findUniqueOrThrow({
      where: { id: applicationId },
      include: { passport: true },
    }),
    prisma.visaPolicy.findUniqueOrThrow({
      where: { id: policyId },
    }),
  ]);

  const requiredDocs = (policy.requiredDocuments as DocumentTemplate[]) ?? [];
  const optionalDocs = (policy.optionalDocuments as DocumentTemplate[]) ?? [];

  const allDocs: (DocumentTemplate & { isRequired: boolean })[] = [
    ...requiredDocs.map((d) => ({ ...d, isRequired: true })),
    ...optionalDocs.map((d) => ({ ...d, isRequired: false })),
  ];

  // Apply dynamic rules based on passport data
  const enrichedDocs = applyEligibilityRules(allDocs, application.passport);

  // Batch create all checklist items
  await prisma.checklistItem.createMany({
    data: enrichedDocs.map((doc, index) => ({
      applicationId,
      itemKey: doc.key,
      title: doc.title,
      description: doc.description,
      isRequired: doc.isRequired,
      acceptedFormats: doc.acceptedFormats,
      maxFileSizeMb: doc.maxFileSizeMb ?? 5,
      status: "PENDING" as ChecklistItemStatus,
      sortOrder: index,
    })),
  });
}

function applyEligibilityRules(
  docs: (DocumentTemplate & { isRequired: boolean })[],
  passport: {
    expiryDate: Date;
    dateOfBirth: Date;
    nationality: string;
  }
): (DocumentTemplate & { isRequired: boolean })[] {
  const enriched = [...docs];
  const now = new Date();

  // Passport validity warning — less than 6 months remaining
  const monthsUntilExpiry =
    (passport.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsUntilExpiry < 6) {
    // Add an urgent note item (not a document, but a checklist notice)
    enriched.unshift({
      key: "passport_validity_warning",
      title: "Passport Validity Notice",
      description: `Your passport expires in less than 6 months. Many countries require at least 6 months validity beyond your travel dates. Consider renewing before applying.`,
      acceptedFormats: [],
      maxFileSizeMb: 0,
      isRequired: false,
    });
  }

  return enriched;
}

/**
 * Returns checklist progress summary for an application.
 */
export async function getChecklistProgress(applicationId: string) {
  const items = await prisma.checklistItem.findMany({
    where: { applicationId },
    select: { isRequired: true, status: true },
  });

  const total = items.length;
  const uploaded = items.filter((i) =>
    ["UPLOADED", "UNDER_REVIEW", "APPROVED"].includes(i.status)
  ).length;
  const approved = items.filter((i) => i.status === "APPROVED").length;
  const rejected = items.filter((i) => i.status === "REJECTED").length;
  const pending = items.filter((i) => i.status === "PENDING").length;

  const requiredItems = items.filter((i) => i.isRequired);
  const requiredTotal = requiredItems.length;
  const requiredApproved = requiredItems.filter((i) => i.status === "APPROVED").length;

  return {
    total,
    uploaded,
    approved,
    rejected,
    pending,
    requiredTotal,
    requiredApproved,
    isMinimumMet: requiredApproved === requiredTotal && requiredTotal > 0,
  };
}

/**
 * Admin reviews a checklist item — approve or reject with optional note.
 */
export async function reviewChecklistItem(
  itemId: string,
  action: "approve" | "reject",
  reviewedById: string,
  options?: { rejectionReason?: string; internalNote?: string }
) {
  const item = await prisma.checklistItem.findUniqueOrThrow({
    where: { id: itemId },
    include: { application: { include: { customer: true } } },
  });

  const newStatus: ChecklistItemStatus = action === "approve" ? "APPROVED" : "REJECTED";

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      status: newStatus,
      reviewedById,
      reviewedAt: new Date(),
      ...(options?.rejectionReason && { rejectionReason: options.rejectionReason }),
      ...(options?.internalNote && { internalNote: options.internalNote }),
    },
  });

  // If rejected, notify customer
  if (action === "reject" && item.application.customer) {
    const { enqueueNotification } = await import("@/lib/services/notification.service");
    await enqueueNotification({
      eventType: "doc_rejected",
      customerId: item.application.customerId,
      applicationId: item.applicationId,
      channel: "EMAIL",
      recipient: item.application.customer.email,
      templateVars: {
        customerName: item.application.customer.fullName,
        documentTitle: item.title,
        rejectionReason: options?.rejectionReason ?? "Please re-upload a clearer copy.",
        applicationId: item.applicationId,
      },
    });
  }

  // Check if all required docs are now approved
  const progress = await getChecklistProgress(item.applicationId);
  if (progress.isMinimumMet) {
    const { updateApplicationStatus } = await import("@/lib/services/application.service");
    await updateApplicationStatus(
      item.applicationId,
      "PAYMENT_PENDING",
      reviewedById,
      "All required documents approved"
    );
  }

  return { status: newStatus, progress };
}
