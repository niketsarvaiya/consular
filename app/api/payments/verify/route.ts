import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPayment } from "@/lib/services/payment.service";

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });
    }

    const result = await verifyPayment({
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      razorpaySignature: parsed.data.razorpay_signature,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[payment verify]", error);
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
