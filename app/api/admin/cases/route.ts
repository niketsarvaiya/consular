import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { getCases } from "@/lib/services/application.service";
import type { CaseFilters } from "@/types";

export async function GET(req: NextRequest) {
  const { session, response } = await requireOpsRole("VIEWER");
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);

    const filters: CaseFilters = {
      status: (searchParams.get("status") as CaseFilters["status"]) ?? undefined,
      countryId: searchParams.get("countryId") ?? undefined,
      visaType: (searchParams.get("visaType") as CaseFilters["visaType"]) ?? undefined,
      assignedToId: searchParams.get("assignedToId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : 20,
    };

    const result = await getCases(filters);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[admin cases GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load cases." }, { status: 500 });
  }
}
