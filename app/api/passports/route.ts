import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { encrypt } from "@/lib/utils/crypto";
import { z } from "zod";

const createPassportSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  passportNumber: z.string().min(6).max(20).regex(/^[A-Z0-9]+$/, "Uppercase alphanumeric only"),
  dateOfBirth: z.string(),
  expiryDate: z.string(),
  issueDate: z.string().optional(),
  issuePlace: z.string().optional(),
  gender: z.enum(["M", "F", "X"]).optional(),
  nationality: z.string().length(3).default("IND"),
});

// GET /api/passports — return the customer's saved passport if any
export async function GET() {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const passport = await prisma.passport.findFirst({
    where: { customerId: session!.user.id, isActive: true },
    select: {
      id: true,
      fullName: true,
      nationality: true,
      dateOfBirth: true,
      expiryDate: true,
      issueDate: true,
      issuePlace: true,
      gender: true,
    },
  });

  return NextResponse.json({ success: true, data: passport });
}

// POST /api/passports — create or update passport for the customer
export async function POST(req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = createPassportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { passportNumber, fullName, dateOfBirth, expiryDate, issueDate, issuePlace, gender, nationality } = parsed.data;

    // Deactivate any previous passport records
    await prisma.passport.updateMany({
      where: { customerId: session!.user.id },
      data: { isActive: false },
    });

    const passport = await prisma.passport.create({
      data: {
        customerId: session!.user.id,
        passportNumber: encrypt(passportNumber),
        fullName,
        nationality,
        dateOfBirth: new Date(dateOfBirth),
        expiryDate: new Date(expiryDate),
        issueDate: issueDate ? new Date(issueDate) : undefined,
        issuePlace,
        gender,
        manuallyVerified: true,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: { passportId: passport.id } }, { status: 201 });
  } catch (error) {
    console.error("[passports POST]", error);
    return NextResponse.json({ success: false, error: "Failed to save passport." }, { status: 500 });
  }
}
