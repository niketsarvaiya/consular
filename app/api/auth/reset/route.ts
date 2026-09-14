import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { logAction } from "@/lib/services/audit.service";

export const runtime = "nodejs";

// POST /api/auth/reset { token, password }
export async function POST(req: NextRequest) {
  const parsed = z.object({
    token: z.string().length(64),
    password: z.string().min(8).max(100),
  }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });

  const hash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const customer = await prisma.customer.findFirst({
    where: { resetTokenHash: hash, resetTokenExpiresAt: { gt: new Date() }, deletedAt: null },
    select: { id: true },
  });
  if (!customer) return NextResponse.json({ success: false, error: "This reset link is invalid or has expired." }, { status: 400 });

  await prisma.customer.update({
    where: { id: customer.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), resetTokenHash: null, resetTokenExpiresAt: null },
  });
  await logAction({ actorType: "customer", actorId: customer.id, action: "UPDATE", resourceType: "customer", resourceId: customer.id, newValue: { passwordReset: true } }).catch(() => {});

  return NextResponse.json({ success: true });
}
