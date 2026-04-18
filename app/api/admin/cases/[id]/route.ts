import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { decrypt, maskPassportNumber } from "@/lib/utils/crypto";
import { getSignedDownloadUrl } from "@/lib/storage/s3";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { response } = await requireOpsRole("VIEWER");
  if (response) return response;

  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true, createdAt: true } },
        passport: true,
        country: true,
        policy: { select: { id: true, versionNumber: true, visaCategory: true, feeDetails: true, processingTimeMin: true, processingTimeMax: true } },
        checklistItems: {
          orderBy: { sortOrder: "asc" },
          include: {
            documents: { where: { isActive: true }, orderBy: { uploadedAt: "desc" }, take: 1 },
            reviewedBy: { select: { fullName: true } },
          },
        },
        paymentOrder: true,
        statusHistory: { orderBy: { changedAt: "asc" }, include: { changedBy: { select: { fullName: true } } } },
        notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { fullName: true } } } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Case not found." }, { status: 404 });
    }

    // Mask passport number for list view — only decrypt for ADMIN role
    const maskedPassport = application.passport
      ? {
          ...application.passport,
          passportNumber: maskPassportNumber(
            (() => { try { return decrypt(application.passport.passportNumber); } catch { return application.passport.passportNumber; } })()
          ),
        }
      : null;

    // Generate signed download URLs for all active documents
    const checklistItemsWithUrls = await Promise.all(
      application.checklistItems.map(async (item) => ({
        ...item,
        documents: await Promise.all(
          item.documents.map(async (doc) => ({
            ...doc,
            downloadUrl: await getSignedDownloadUrl(doc.fileKey),
          }))
        ),
      }))
    );

    return NextResponse.json({
      success: true,
      data: { ...application, passport: maskedPassport, checklistItems: checklistItemsWithUrls },
    });
  } catch (error) {
    console.error("[admin case GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load case." }, { status: 500 });
  }
}
