import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { moveCoins } from "@/lib/services/wallet.service";

export const runtime = "nodejs";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// POST /api/wallet/verify — verifies the Razorpay signature, then credits coins once.
export async function POST(req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid payload." }, { status: 400 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  if (expected.length !== razorpay_signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))) {
    return NextResponse.json({ success: false, error: "Payment verification failed." }, { status: 400 });
  }

  const purchase = await prisma.coinPurchase.findUnique({ where: { gatewayOrderId: razorpay_order_id } });
  if (!purchase) return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  // The signature proves the payment, not who is asking — check the owner too.
  if (purchase.customerId !== session!.user.id) {
    return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  }
  if (purchase.status === "PAID") {
    const { coinBalance } = await prisma.customer.findUniqueOrThrow({
      where: { id: purchase.customerId }, select: { coinBalance: true },
    });
    return NextResponse.json({ success: true, data: { coins: purchase.coins, balance: coinBalance, alreadyCredited: true } });
  }

  let balance = 0;
  await prisma.$transaction(async (tx) => {
    await tx.coinPurchase.update({
      where: { id: purchase.id },
      data: { status: "PAID", gatewayPaymentId: razorpay_payment_id, paidAt: new Date() },
    });
    balance = await moveCoins({
      customerId: purchase.customerId,
      delta: purchase.coins,
      reason: "purchase",
      coinPurchaseId: purchase.id,
      note: `Bought ${purchase.coins.toLocaleString("en-IN")} coins`,
    }, tx);
  });

  return NextResponse.json({ success: true, data: { coins: purchase.coins, balance } });
}
