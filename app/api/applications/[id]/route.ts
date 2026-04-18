import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { getApplicationById } from "@/lib/services/application.service";
import { getChecklistProgress } from "@/lib/services/checklist.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const application = await getApplicationById(params.id, session!.user.id);

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    const progress = await getChecklistProgress(params.id);

    return NextResponse.json({ success: true, data: { ...application, progress } });
  } catch (error) {
    console.error("[application GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load application." }, { status: 500 });
  }
}
