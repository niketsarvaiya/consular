import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

// GET /api/wallet — the caller's own agent status + balance.
export async function GET() {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const customer = await prisma.customer.findUnique({
    where: { id: session!.user.id },
    select: { isAgent: true, coinBalance: true },
  });

  return NextResponse.json({
    success: true,
    data: { isAgent: customer?.isAgent ?? false, coinBalance: customer?.coinBalance ?? 0 },
  });
}
