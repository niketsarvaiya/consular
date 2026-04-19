import { prisma } from "@/lib/db/prisma";
import { logAction } from "@/lib/services/audit.service";
import { generateChecklist } from "@/lib/services/checklist.service";
import { enqueueNotification } from "@/lib/services/notification.service";
import type { ApplicationStatus, VisaType } from "@prisma/client";
import type { CreateApplicationInput } from "@/lib/utils/validators";
import type { CaseFilters } from "@/types";

export async function createApplication(
  input: CreateApplicationInput,
  customerId: string
): Promise<string> {
  // Load the active policy for this country + visa type
  const policy = await prisma.visaPolicy.findFirst({
    where: {
      countryId: input.countryId,
      visaType: input.visaType as VisaType,
      nationality: "IND",
      status: "ACTIVE",
    },
  });

  if (!policy) {
    throw new Error("No active visa policy found for this country and visa type.");
  }

  const application = await prisma.application.create({
    data: {
      customerId,
      passportId: input.passportId,
      countryId: input.countryId,
      visaType: input.visaType as VisaType,
      policyId: policy.id,
      policyVersionNumber: policy.versionNumber,
      status: "NEW_LEAD",
      travelDateFrom: input.travelDateFrom ? new Date(input.travelDateFrom) : undefined,
      travelDateTo: input.travelDateTo ? new Date(input.travelDateTo) : undefined,
      purposeNotes: input.purposeNotes,
    },
  });

  // Record initial status history entry
  await prisma.caseStatusHistory.create({
    data: {
      applicationId: application.id,
      fromStatus: undefined,
      toStatus: "NEW_LEAD",
    },
  });

  // Generate checklist items from policy
  await generateChecklist(application.id, policy.id);

  // Update status to DOCS_PENDING
  await updateApplicationStatus(
    application.id,
    "DOCS_PENDING",
    undefined,
    "Checklist generated"
  );

  // Notify customer
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
  });

  await enqueueNotification({
    eventType: "application_created",
    customerId,
    applicationId: application.id,
    channel: "EMAIL",
    recipient: customer.email,
    templateVars: {
      customerName: customer.fullName,
      applicationId: application.id,
      country: input.countryId, // will be resolved in job
    },
  });

  await logAction({
    actorType: "customer",
    action: "CREATE",
    resourceType: "application",
    resourceId: application.id,
    newValue: { countryId: input.countryId, visaType: input.visaType },
  }).catch((e) => console.warn("[createApplication] audit log failed:", e.message));

  return application.id;
}

export async function getApplicationById(applicationId: string, customerId?: string) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      ...(customerId && { customerId }),
    },
    include: {
      country: true,
      passport: true,
      checklistItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          documents: {
            where: { isActive: true },
            orderBy: { uploadedAt: "desc" },
            take: 1,
          },
        },
      },
      paymentOrder: true,
      statusHistory: {
        orderBy: { changedAt: "asc" },
        include: { changedBy: { select: { fullName: true } } },
      },
    },
  });
}

export async function getCustomerApplications(customerId: string) {
  return prisma.application.findMany({
    where: { customerId },
    include: {
      country: true,
      checklistItems: {
        select: {
          id: true,
          isRequired: true,
          status: true,
        },
      },
      paymentOrder: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  changedById?: string,
  notes?: string
) {
  const app = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    select: { status: true, customerId: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    await tx.caseStatusHistory.create({
      data: {
        applicationId,
        fromStatus: app.status,
        toStatus: newStatus,
        changedById,
        notes,
      },
    });
  });

  if (changedById) {
    await logAction({
      actorId: changedById,
      actorType: "ops_user",
      action: "STATUS_CHANGE",
      resourceType: "application",
      resourceId: applicationId,
      oldValue: { status: app.status },
      newValue: { status: newStatus, notes },
    });
  }
}

// ─── Admin case listing ───────────────────────────────────────────────────────

export async function getCases(filters: CaseFilters) {
  const {
    status,
    countryId,
    visaType,
    assignedToId,
    search,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 20,
  } = filters;

  const skip = (page - 1) * pageSize;

  const where = {
    ...(status && { status }),
    ...(countryId && { countryId }),
    ...(visaType && { visaType }),
    ...(assignedToId && { assignedToId }),
    ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
    ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
    ...(search && {
      OR: [
        { id: { contains: search, mode: "insensitive" as const } },
        { customer: { fullName: { contains: search, mode: "insensitive" as const } } },
        { customer: { email: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
        country: { select: { name: true, flagUrl: true, code: true } },
        assignedTo: { select: { fullName: true } },
        paymentOrder: { select: { status: true, amount: true } },
        _count: {
          select: {
            checklistItems: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.application.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function assignCase(
  applicationId: string,
  assignedToId: string,
  assignedById: string
) {
  await prisma.application.update({
    where: { id: applicationId },
    data: { assignedToId },
  });

  await logAction({
    actorId: assignedById,
    actorType: "ops_user",
    action: "ASSIGN",
    resourceType: "application",
    resourceId: applicationId,
    newValue: { assignedToId },
  });
}

export async function addCaseNote(
  applicationId: string,
  content: string,
  noteType: "internal" | "customer_visible",
  authorId: string
) {
  const note = await prisma.caseNote.create({
    data: { applicationId, content, noteType, authorId },
    include: { author: { select: { fullName: true } } },
  });

  await logAction({
    actorId: authorId,
    actorType: "ops_user",
    action: "NOTE_ADDED",
    resourceType: "application",
    resourceId: applicationId,
    newValue: { noteType, contentLength: content.length },
  });

  return note;
}

export async function getDashboardMetrics() {
  const defaultMetrics = {
    totalCases: 0, newToday: 0, pendingDocReview: 0, pendingPayment: 0,
    activeCases: 0, approvedThisMonth: 0, revenueThisMonth: 0,
    avgProcessingDays: 0, policiesNeedingReview: 0,
  };

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalCases,
      newToday,
      pendingDocReview,
      pendingPayment,
      approvedThisMonth,
      revenueResult,
      policiesNeedingReview,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.application.count({ where: { status: "DOCS_UNDER_REVIEW" } }),
      prisma.application.count({ where: { status: "PAYMENT_PENDING" } }),
      prisma.application.count({
        where: { status: "APPROVED", updatedAt: { gte: startOfMonth } },
      }),
      prisma.paymentOrder.aggregate({
        _sum: { amount: true },
        where: { status: "PAID", paidAt: { gte: startOfMonth } },
      }),
      prisma.visaPolicy.count({ where: { status: "NEEDS_REVIEW" } }),
    ]);

    // Run raw query separately so a failure doesn't crash all metrics
    let avgProcessingDays = 0;
    try {
      const avgResult = await prisma.$queryRaw<{ avg_days: number }[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) as avg_days
        FROM applications
        WHERE status IN ('APPROVED', 'REJECTED', 'CLOSED')
        AND created_at >= ${startOfMonth}
      `;
      avgProcessingDays = Math.round(avgResult[0]?.avg_days ?? 0);
    } catch (e) {
      console.warn("[getDashboardMetrics] avgProcessingDays query failed:", (e as Error).message);
    }

    const activeCases = await prisma.application.count({
      where: { status: { notIn: ["APPROVED", "REJECTED", "CLOSED"] } },
    });

    return {
      totalCases, newToday, pendingDocReview, pendingPayment, activeCases,
      approvedThisMonth,
      revenueThisMonth: Math.round((revenueResult._sum.amount ?? 0) / 100),
      avgProcessingDays,
      policiesNeedingReview,
    };
  } catch (e) {
    console.error("[getDashboardMetrics] failed:", (e as Error).message);
    return defaultMetrics;
  }
}
