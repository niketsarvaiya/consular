import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { markOrderPaid } from "@/lib/services/payment.service";

export const runtime = "nodejs";
// Never cache; must read the raw body for signature verification.
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the reliable source of truth for payment status.
 * Fires server-to-server even if the customer closes the tab before the
 * client-side callback runs. Configure in the Razorpay dashboard:
 *   URL:    https://visasetgo.com/api/webhooks/razorpay
 *   Events: payment.captured, order.paid
 *   Secret: must match RAZORPAY_WEBHOOK_SECRET
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[razorpay webhook] RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  const valid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id ?? event.payload?.order?.entity?.id;
      const paymentId = payment?.id;
      if (orderId && paymentId) {
        await markOrderPaid({ razorpayOrderId: orderId, razorpayPaymentId: paymentId });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[razorpay webhook] processing error", error);
    // Non-2xx → Razorpay retries; markOrderPaid is idempotent so retries are safe.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
