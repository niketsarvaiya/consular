import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/countries/[id]
 * Toggle isActive status or update sortOrder/priorityRank.
 * Body: { isActive?: boolean, sortOrder?: number, priorityRank?: number }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireOpsRole("OPS");
  if (response) return response;

  const body = await req.json().catch(() => ({}));
  const { isActive, sortOrder, priorityRank } = body as {
    isActive?: boolean;
    sortOrder?: number;
    priorityRank?: number;
  };

  const data: Record<string, unknown> = {};
  if (isActive !== undefined) data.isActive = isActive;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (priorityRank !== undefined) data.priorityRank = priorityRank;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.country.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ country: updated });
}
