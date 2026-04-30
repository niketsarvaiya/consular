import { NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/countries
 * Returns all countries with their policy counts and active status.
 */
export async function GET() {
  const { response } = await requireOpsRole("VIEWER");
  if (response) return response;

  const countries = await prisma.country.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { policies: true, applications: true } },
      policies: {
        select: { id: true, visaType: true, status: true, lastRefreshedAt: true },
        orderBy: { visaType: "asc" },
      },
    },
  });

  return NextResponse.json({ countries });
}
