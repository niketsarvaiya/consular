import { NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { getDashboardMetrics } from "@/lib/services/application.service";

export async function GET() {
  const { response } = await requireOpsRole("VIEWER");
  if (response) return response;

  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error("[admin metrics GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load metrics." }, { status: 500 });
  }
}
