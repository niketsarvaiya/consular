import { prisma } from "@/lib/db/prisma";
import { hashContent } from "@/lib/utils/crypto";
import { logAction } from "@/lib/services/audit.service";
import { policyRefreshQueue } from "@/lib/jobs/queue";
import type { PolicyStatus, VisaType } from "@prisma/client";
import type { PolicyEditorInput } from "@/lib/utils/validators";

// ─── Read ──────────────────────────────────────────────────────────────────────

export async function getPolicies(filters?: {
  status?: PolicyStatus;
  countryId?: string;
}) {
  return prisma.visaPolicy.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.countryId && { countryId: filters.countryId }),
    },
    include: {
      country: true,
      approvedBy: { select: { fullName: true, email: true } },
    },
    orderBy: [{ country: { name: "asc" } }, { visaType: "asc" }],
  });
}

export async function getPolicyById(policyId: string) {
  return prisma.visaPolicy.findUnique({
    where: { id: policyId },
    include: {
      country: true,
      sources: true,
      approvedBy: { select: { fullName: true, email: true } },
    },
  });
}

export async function getActivePolicy(countryId: string, visaType: VisaType) {
  return prisma.visaPolicy.findUnique({
    where: {
      countryId_visaType_nationality: {
        countryId,
        visaType,
        nationality: "IND",
      },
      status: "ACTIVE",
    } as Parameters<typeof prisma.visaPolicy.findUnique>[0]["where"],
    include: { country: true, sources: true },
  });
}

export async function getPolicyVersionHistory(policyId: string) {
  return prisma.policySnapshot.findMany({
    where: { policyId },
    orderBy: { versionNumber: "desc" },
  });
}

export async function getPolicySnapshot(policyId: string, versionNumber: number) {
  return prisma.policySnapshot.findFirst({
    where: { policyId, versionNumber },
  });
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export async function createPolicy(
  data: PolicyEditorInput & {
    countryId: string;
    visaType: VisaType;
    createdById: string;
  }
) {
  const { countryId, visaType, createdById, ...policyData } = data;

  const policy = await prisma.visaPolicy.create({
    data: {
      countryId,
      visaType,
      nationality: "IND",
      visaCategory: policyData.visaCategory,
      eligibilityRules: policyData.eligibilityRules as object[],
      requiredDocuments: policyData.requiredDocuments as object[],
      optionalDocuments: policyData.optionalDocuments as object[],
      feeDetails: policyData.feeDetails as object,
      processingTimeMin: policyData.processingTimeMin,
      processingTimeMax: policyData.processingTimeMax,
      processingNotes: policyData.processingNotes,
      appointmentNotes: policyData.appointmentNotes,
      biometricsNotes: policyData.biometricsNotes,
      embassyLinks: policyData.embassyLinks as object[],
      vacNotes: policyData.vacNotes,
      internalOpsNotes: policyData.internalOpsNotes,
      status: "DRAFT",
      versionNumber: 1,
    },
  });

  // Create initial snapshot
  await prisma.policySnapshot.create({
    data: {
      policyId: policy.id,
      versionNumber: 1,
      snapshot: { ...policyData } as object,
      changeSource: "initial",
      status: "approved",
    },
  });

  await logAction({
    actorId: createdById,
    actorType: "ops_user",
    action: "CREATE",
    resourceType: "policy",
    resourceId: policy.id,
    newValue: { countryId, visaType },
  });

  return policy;
}

export async function updatePolicy(
  policyId: string,
  data: Partial<PolicyEditorInput>,
  updatedById: string
) {
  const existing = await prisma.visaPolicy.findUniqueOrThrow({
    where: { id: policyId },
  });

  const updated = await prisma.visaPolicy.update({
    where: { id: policyId },
    data: {
      ...(data.visaCategory && { visaCategory: data.visaCategory }),
      ...(data.eligibilityRules && { eligibilityRules: data.eligibilityRules as object[] }),
      ...(data.requiredDocuments && { requiredDocuments: data.requiredDocuments as object[] }),
      ...(data.optionalDocuments && { optionalDocuments: data.optionalDocuments as object[] }),
      ...(data.feeDetails && { feeDetails: data.feeDetails as object }),
      ...(data.processingTimeMin !== undefined && { processingTimeMin: data.processingTimeMin }),
      ...(data.processingTimeMax !== undefined && { processingTimeMax: data.processingTimeMax }),
      ...(data.processingNotes !== undefined && { processingNotes: data.processingNotes }),
      ...(data.appointmentNotes !== undefined && { appointmentNotes: data.appointmentNotes }),
      ...(data.biometricsNotes !== undefined && { biometricsNotes: data.biometricsNotes }),
      ...(data.embassyLinks && { embassyLinks: data.embassyLinks as object[] }),
      ...(data.vacNotes !== undefined && { vacNotes: data.vacNotes }),
      ...(data.internalOpsNotes !== undefined && { internalOpsNotes: data.internalOpsNotes }),
    },
  });

  await logAction({
    actorId: updatedById,
    actorType: "ops_user",
    action: "UPDATE",
    resourceType: "policy",
    resourceId: policyId,
    oldValue: existing as unknown as Record<string, unknown>,
    newValue: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

/**
 * Triggers an async policy refresh job for the given policy.
 * The actual fetch + diff happens in the worker process.
 */
export async function triggerPolicyRefresh(
  policyId: string,
  triggeredByUserId: string
) {
  const policy = await prisma.visaPolicy.findUniqueOrThrow({
    where: { id: policyId },
    include: { country: true },
  });

  await policyRefreshQueue.add(
    "refresh",
    {
      policyId,
      countryCode: policy.country.code,
      visaType: policy.visaType,
      triggeredByUserId,
    },
    { jobId: `refresh-${policyId}-${Date.now()}` }
  );

  await logAction({
    actorId: triggeredByUserId,
    actorType: "ops_user",
    action: "POLICY_REFRESH",
    resourceType: "policy",
    resourceId: policyId,
  });

  return { queued: true };
}

/**
 * Admin approves a pending policy snapshot, making it the new ACTIVE version.
 */
export async function approvePolicySnapshot(
  snapshotId: string,
  approvedById: string,
  reviewNotes?: string
) {
  const snapshot = await prisma.policySnapshot.findUniqueOrThrow({
    where: { id: snapshotId },
    include: { policy: true },
  });

  if (snapshot.status !== "pending_review") {
    throw new Error("Snapshot is not in pending_review state");
  }

  const snapshotData = snapshot.snapshot as Record<string, unknown>;

  // Archive old active policy data via snapshot, then apply new version
  await prisma.$transaction(async (tx) => {
    // Update the snapshot to approved
    await tx.policySnapshot.update({
      where: { id: snapshotId },
      data: {
        status: "approved",
        reviewedById: approvedById,
        reviewedAt: new Date(),
        reviewNotes,
      },
    });

    // Apply the snapshot data to the live policy
    await tx.visaPolicy.update({
      where: { id: snapshot.policyId },
      data: {
        status: "ACTIVE",
        versionNumber: snapshot.versionNumber,
        lastApprovedAt: new Date(),
        approvedById,
        ...(snapshotData.visaCategory !== undefined && {
          visaCategory: snapshotData.visaCategory as "REQUIRED" | "E_VISA" | "ETA" | "VISA_EXEMPT",
        }),
        ...(snapshotData.requiredDocuments !== undefined && {
          requiredDocuments: snapshotData.requiredDocuments as object[],
        }),
        ...(snapshotData.feeDetails !== undefined && {
          feeDetails: snapshotData.feeDetails as object,
        }),
        ...(snapshotData.processingTimeMin !== undefined && {
          processingTimeMin: snapshotData.processingTimeMin as number,
        }),
        ...(snapshotData.processingTimeMax !== undefined && {
          processingTimeMax: snapshotData.processingTimeMax as number,
        }),
      },
    });
  });

  await logAction({
    actorId: approvedById,
    actorType: "ops_user",
    action: "POLICY_APPROVE",
    resourceType: "policy_snapshot",
    resourceId: snapshotId,
    newValue: { reviewNotes },
  });

  return { approved: true };
}

/**
 * Admin rejects a pending policy snapshot.
 */
export async function rejectPolicySnapshot(
  snapshotId: string,
  rejectedById: string,
  reviewNotes: string
) {
  const snapshot = await prisma.policySnapshot.findUniqueOrThrow({
    where: { id: snapshotId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.policySnapshot.update({
      where: { id: snapshotId },
      data: {
        status: "rejected",
        reviewedById: rejectedById,
        reviewedAt: new Date(),
        reviewNotes,
      },
    });

    // Reset policy status back to ACTIVE if it was marked NEEDS_REVIEW
    if (snapshot.status === "pending_review") {
      await tx.visaPolicy.updateMany({
        where: { id: snapshot.policyId, status: "NEEDS_REVIEW" },
        data: { status: "ACTIVE" },
      });
    }
  });

  await logAction({
    actorId: rejectedById,
    actorType: "ops_user",
    action: "POLICY_REJECT",
    resourceType: "policy_snapshot",
    resourceId: snapshotId,
    newValue: { reviewNotes },
  });
}
