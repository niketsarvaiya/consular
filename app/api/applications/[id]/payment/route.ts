import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { createPaymentOrder } from "@/lib/services/payment.service";
import { getChecklistProgress } from "@/lib/services/checklist.service";
import { getApplicationById } from "@/lib/services/application.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    // Verify application belongs to this customer
    const application = await getApplicationById(params.id, session!.user.id);
    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    // Check that minimum docs are met
    const progress = await getChecklistProgress(params.id);
    if (!progress.isMinimumMet) {
      return NextResponse.json(
        {
          success: false,
          error: "All required documents must be approved before payment.",
          progress,
        },
        { status: 422 }
      );
    }

    const orderData = await createPaymentOrder(params.id);
    return NextResponse.json({ success: true, data: orderData });
  } catch (error) {
    console.error("[payment POST]", error);
    const message = error instanceof Error ? error.message : "Payment creation failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
