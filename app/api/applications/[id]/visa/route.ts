import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { getVisaDownloadUrl } from "@/lib/services/visa.service";

export const runtime = "nodejs";

// GET — customer fetches a short-lived signed URL for their issued visa.
// Ownership-enforced (customerId), so it can't be used to read another user's visa.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const visa = await getVisaDownloadUrl(params.id, session!.user.id);
  if (!visa) return NextResponse.json({ success: false, error: "No visa document available." }, { status: 404 });

  return NextResponse.json({ success: true, data: visa });
}
