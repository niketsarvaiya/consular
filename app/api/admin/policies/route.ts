import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { getPolicies } from "@/lib/services/policy.service";

export async function GET(req: NextRequest) {
  const { response } = await requireOpsRole("VIEWER");
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as "ACTIVE" | "DRAFT" | "NEEDS_REVIEW" | null;

    const policies = await getPolicies(status ? { status } : undefined);
    return NextResponse.json({ success: true, data: policies });
  } catch (error) {
    console.error("[admin policies GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load policies." }, { status: 500 });
  }
}
