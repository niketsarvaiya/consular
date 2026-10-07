import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { payApplicationWithCoins } from "@/lib/services/payment.service";
import { InsufficientCoinsError } from "@/lib/services/wallet.service";
import { getChecklistProgress } from "@/lib/services/checklist.service";
import { getApplicationById } from "@/lib/services/application.service";

export const runtime = "nodejs";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const application = await getApplicationById(params.id, session!.user.id);
    if (!application) return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });

    const progress = await getChecklistProgress(params.id);
    if (!progress.isMinimumMet) {
      return NextResponse.json({ success: false, error: "All required documents must be approved before payment." }, { status: 422 });
    }

    const result = await payApplicationWithCoins(params.id, session!.user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof InsufficientCoinsError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 402 });
    }
    console.error("[pay-with-coins]", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Payment failed." }, { status: 500 });
  }
}
