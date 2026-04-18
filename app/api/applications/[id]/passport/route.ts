import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { uploadPassportDocument } from "@/lib/services/document.service";
import { prisma } from "@/lib/db/prisma";
import { passportCorrectionSchema } from "@/lib/utils/validators";
import { encrypt } from "@/lib/utils/crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/applications/[id]/passport — upload passport image, triggers OCR job
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Passport image is required." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 10MB limit." }, { status: 400 });
    }

    // Ensure application belongs to customer
    const app = await prisma.application.findFirst({
      where: { id: params.id, customerId: session!.user.id },
    });
    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    // Create or reuse passport record
    let passport = await prisma.passport.findFirst({
      where: { id: app.passportId },
    });

    if (!passport) {
      passport = await prisma.passport.create({
        data: {
          customerId: session!.user.id,
          fullName: session!.user.name ?? "Unknown",
          passportNumber: encrypt("PENDING"),
          nationality: "IND",
          dateOfBirth: new Date("1990-01-01"), // Placeholder — filled after OCR
          expiryDate: new Date("2030-01-01"),   // Placeholder — filled after OCR
        },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadPassportDocument({
      customerId: session!.user.id,
      passportId: passport.id,
      buffer,
      originalName: file.name,
      mimeType: file.type,
    });

    return NextResponse.json({
      success: true,
      data: { passportId: passport.id, ocrQueued: result.ocrQueued },
    });
  } catch (error) {
    console.error("[passport upload POST]", error);
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/applications/[id]/passport — save manually corrected OCR data
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = passportCorrectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const app = await prisma.application.findFirst({
      where: { id: params.id, customerId: session!.user.id },
    });
    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    await prisma.passport.update({
      where: { id: app.passportId },
      data: {
        fullName: parsed.data.fullName,
        passportNumber: encrypt(parsed.data.passportNumber),
        nationality: parsed.data.nationality,
        dateOfBirth: new Date(parsed.data.dateOfBirth),
        expiryDate: new Date(parsed.data.expiryDate),
        issueDate: parsed.data.issueDate ? new Date(parsed.data.issueDate) : undefined,
        issuePlace: parsed.data.issuePlace,
        gender: parsed.data.gender,
        manuallyVerified: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[passport PATCH]", error);
    return NextResponse.json({ success: false, error: "Update failed." }, { status: 500 });
  }
}
