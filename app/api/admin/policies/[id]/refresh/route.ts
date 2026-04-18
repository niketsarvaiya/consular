import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { triggerPolicyRefresh } from "@/lib/services/policy.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireOpsRole("OPS");
  if (response) return response;

  try {
    const result = await triggerPolicyRefresh(params.id, session!.user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[policy refresh POST]", error);
    return NextResponse.json({ success: false, error: "Refresh trigger failed." }, { status: 500 });
  }
}
