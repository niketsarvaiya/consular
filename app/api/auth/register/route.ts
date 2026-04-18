import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/utils/validators";
import { logAction } from "@/lib/services/audit.service";
import { enqueueNotification } from "@/lib/services/notification.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone } = parsed.data;

    // Check for existing account
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const customer = await prisma.customer.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        consentGivenAt: new Date(),
        isVerified: true, // In V1 skip email verification; add in V2
      },
    });

    await logAction({
      // actorId intentionally omitted: AuditLog.actorId FK points to OpsUser, not Customer
      actorType: "customer",
      actorEmail: customer.email,
      action: "CREATE",
      resourceType: "customer",
      resourceId: customer.id,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    }).catch((e) => console.warn("[register] audit log failed:", e.message));

    await enqueueNotification({
      eventType: "welcome",
      customerId: customer.id,
      channel: "EMAIL",
      recipient: email,
      templateVars: { customerName: fullName },
    });

    return NextResponse.json({ success: true, message: "Account created." }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ success: false, error: "Registration failed." }, { status: 500 });
  }
}
