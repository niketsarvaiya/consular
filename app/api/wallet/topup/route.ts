import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const MIN_COINS = 5000;
const MAX_COINS = 1000000;

// POST /api/wallet/topup { coins } — creates a Razorpay order for a coin purchase.
export async function POST(req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { isAgent: true, fullName: true, email: true },
  });
  if (!customer.isAgent) {
    return NextResponse.json({ success: false, error: "Coin wallets are only available to agent accounts." }, { status: 403 });
  }

  const parsed = z.object({ coins: z.number().int().min(MIN_COINS).max(MAX_COINS) }).safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: `Buy between ${MIN_COINS.toLocaleString("en-IN")} and ${MAX_COINS.toLocaleString("en-IN")} coins.` }, { status: 400 });
  }

  const { coins } = parsed.data;
  const amount = coins * 100; // 1 coin = ₹1

  const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
  const order = await rzp.orders.create({
    amount,
    currency: "INR",
    receipt: `coins_${session!.user.id.slice(-8)}_${Date.now().toString(36)}`.slice(0, 40),
    notes: { customerId: session!.user.id, coins: String(coins) },
  });

  await prisma.coinPurchase.create({
    data: { customerId: session!.user.id, coins, amount, provider: "razorpay", gatewayOrderId: order.id, status: "CREATED" },
  });

  return NextResponse.json({
    success: true,
    data: { orderId: order.id, amount, currency: "INR", keyId: process.env.RAZORPAY_KEY_ID, coins,
            customerName: customer.fullName, customerEmail: customer.email },
  });
}
