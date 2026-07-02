import { prisma } from "@/lib/db/prisma";
import { deleteDocument } from "@/lib/storage/s3";

/**
 * DPDP "right to erasure" — permanently deletes a customer and ALL their
 * personal data: uploaded documents & passport images from R2 storage, and
 * every related DB row. Irreversible.
 */
export async function deleteCustomerData(customerId: string): Promise<{ filesDeleted: number }> {
  // 1. Collect every stored file key for this customer.
  const [docs, passports] = await Promise.all([
    prisma.document.findMany({ where: { customerId }, select: { fileKey: true } }),
    prisma.passport.findMany({ where: { customerId }, select: { frontPageFileKey: true } }),
  ]);

  const keys = [
    ...docs.map((d) => d.fileKey),
    ...passports.map((p) => p.frontPageFileKey).filter((k): k is string => !!k),
  ];

  // 2. Purge the actual files from R2 (best-effort; don't block DB cleanup).
  const results = await Promise.allSettled(keys.map((k) => deleteDocument(k)));
  const filesDeleted = results.filter((r) => r.status === "fulfilled").length;

  // 3. Delete DB rows in FK-safe order (children first), atomically.
  await prisma.$transaction([
    prisma.document.deleteMany({ where: { customerId } }),
    prisma.communication.deleteMany({ where: { OR: [{ customerId }, { application: { customerId } }] } }),
    prisma.paymentOrder.deleteMany({ where: { application: { customerId } } }),
    prisma.caseStatusHistory.deleteMany({ where: { application: { customerId } } }),
    prisma.caseNote.deleteMany({ where: { application: { customerId } } }),
    prisma.checklistItem.deleteMany({ where: { application: { customerId } } }),
    prisma.application.deleteMany({ where: { customerId } }),
    prisma.passport.deleteMany({ where: { customerId } }),
    prisma.customer.delete({ where: { id: customerId } }),
  ]);

  return { filesDeleted };
}
