import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth/guards";
import { ensureTrip } from "@/lib/services/trip.service";

// POST /api/trips { applicationId } — wraps an application in a trip (idempotent) so more travellers can be added.
export async function POST(req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const parsed = z.object({ applicationId: z.string().cuid() }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });

  try {
    const trip = await ensureTrip(parsed.data.applicationId, session!.user.id);
    return NextResponse.json({ success: true, data: { tripId: trip.id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed." }, { status: 404 });
  }
}
