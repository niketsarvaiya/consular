import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { moveCoins, InsufficientCoinsError } from "@/lib/services/wallet.service";
import { logAction } from "@/lib/services/audit.service";

export const runtime = "nodejs";

const schema = z.object({
  customerId: z.string().cuid(),
  action: z.enum(["set_agent", "adjust_coins"]),
  isAgent: z.boolean().optional(),
  agencyName: z.string().max(120).optional(),
  coins: z.number().int().optional(), // + credit, - debit
  note: z.string().max(200).optional(),
});

// POST /api/admin/agents — mark a customer as an agent, or credit/debit their wallet.
export async function POST(req: NextRequest) {
  const { session, response } = await requireOpsRole("ADMIN");
  if (response) return response;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  const { customerId, action, isAgent, agencyName, coins, note } = parsed.data;

  try {
    if (action === "set_agent") {
      await prisma.customer.update({
        where: { id: customerId },
        data: { isAgent: isAgent ?? false, agencyName: agencyName || null },
      });
      await logAction({
        actorType: "ops_user", actorId: session!.user.id, action: "UPDATE",
        resourceType: "customer", resourceId: customerId, newValue: { isAgent, agencyName },
      }).catch(() => {});
      return NextResponse.json({ success: true });
    }

    if (!coins || coins === 0) {
      return NextResponse.json({ success: false, error: "Enter a non-zero number of coins." }, { status: 400 });
    }
    const balance = await moveCoins({
      customerId,
      delta: coins,
      reason: coins > 0 ? "admin_credit" : "admin_debit",
      note: note || (coins > 0 ? "Manual credit" : "Manual debit"),
      createdById: session!.user.id,
    });
    await logAction({
      actorType: "ops_user", actorId: session!.user.id, action: "UPDATE",
      resourceType: "coin_wallet", resourceId: customerId, newValue: { coins, balance, note },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: { balance } });
  } catch (error) {
    if (error instanceof InsufficientCoinsError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("[admin agents]", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed." }, { status: 500 });
  }
}
