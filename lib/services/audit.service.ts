import { prisma } from "@/lib/db/prisma";
import type { AuditAction, OpsUser } from "@prisma/client";

interface LogActionParams {
  actorId?: string;
  actorType: "ops_user" | "system" | "customer";
  actorEmail?: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAction(params: LogActionParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      actorType: params.actorType,
      actorEmail: params.actorEmail,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      oldValue: params.oldValue !== undefined ? (params.oldValue as object) : undefined,
      newValue: params.newValue !== undefined ? (params.newValue as object) : undefined,
      metadata: params.metadata as object | undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

export async function getAuditLogs(params: {
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { page = 1, pageSize = 50 } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(params.resourceType && { resourceType: params.resourceType }),
    ...(params.resourceId && { resourceId: params.resourceId }),
    ...(params.actorId && { actorId: params.actorId }),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { actor: { select: { fullName: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
