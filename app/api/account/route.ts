import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { deleteCustomerData } from "@/lib/services/account.service";
import { rateLimit, tooManyRequests } from "@/lib/security/rate-limit";
import { logAction } from "@/lib/services/audit.service";

export const runtime = "nodejs";

/**
 * DELETE /api/account — permanently erase the signed-in customer's account and
 * all their data (DPDP right to erasure). Irreversible.
 */
export async function DELETE(_req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const rl = await rateLimit(`account-delete:${session!.user.id}`, 3, 3600);
  if (!rl.ok) return NextResponse.json(tooManyRequests(), { status: 429 });

  try {
    const { filesDeleted } = await deleteCustomerData(session!.user.id);

    await logAction({
      actorType: "customer",
      actorEmail: session!.user.email ?? undefined,
      action: "DELETE",
      resourceType: "customer",
      resourceId: session!.user.id,
      newValue: { filesDeleted, reason: "self-service erasure" },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[account DELETE]", error);
    return NextResponse.json({ success: false, error: "Account deletion failed. Please contact support." }, { status: 500 });
  }
}
