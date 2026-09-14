import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { enqueueNotification } from "@/lib/services/notification.service";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

// POST /api/auth/forgot { email } — always 200 so the response can't be used to enumerate accounts.
export async function POST(req: NextRequest) {
  const rl = await rateLimit(`forgot:${clientIp(req)}`, 5, 900);
  if (!rl.ok) return NextResponse.json(tooManyRequests(), { status: 429 });

  const parsed = z.object({ email: z.string().email() }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: "Enter a valid email." }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const customer = await prisma.customer.findFirst({ where: { email, deletedAt: null } });

  if (customer) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const base = (process.env.APP_URL ?? "https://visasetgo.com").replace(/\/$/, "");
    await enqueueNotification({
      eventType: "password_reset",
      customerId: customer.id,
      channel: "EMAIL",
      recipient: customer.email,
      templateVars: { customerName: customer.fullName.split(" ")[0], resetUrl: `${base}/auth/reset?token=${token}` },
    });
  }

  return NextResponse.json({ success: true });
}
