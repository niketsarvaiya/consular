import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/policies/[id]/update
 * Full manual update of a policy from the drag-drop editor.
 * Creates a new PolicySnapshot (pending_review) so changes are auditable.
 *
 * Body shape matches PolicyEditorPayload:
 * {
 *   visaCategory, status,
 *   processingTimeMin, processingTimeMax, processingNotes,
 *   requiredDocuments, optionalDocuments,
 *   feeDetails: { currency, foreignGovFee, governmentFeeINR, serviceFeeINR, gatewayFeePct, gstPct, totalINR, notes },
 *   appointmentNotes, biometricsNotes, vacNotes,
 *   embassyLinks,
 *   contentFaqs,          // JSON blob stored in eligibilityRules.faqs
 *   contentTagline,       // stored in eligibilityRules.tagline
 *   contentHeroImage,     // stored in eligibilityRules.heroImage
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireOpsRole("OPS");
  if (response) return response;

  const body = await req.json();

  const existing = await prisma.visaPolicy.findUnique({
    where: { id: params.id },
    include: { country: { select: { name: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  // Build update payload
  const {
    visaCategory,
    status,
    processingTimeMin,
    processingTimeMax,
    processingNotes,
    requiredDocuments,
    optionalDocuments,
    feeDetails,
    appointmentNotes,
    biometricsNotes,
    vacNotes,
    embassyLinks,
    contentFaqs,
    contentTagline,
    contentHeroImages,
  } = body;

  // Merge content fields into eligibilityRules JSON (repurpose as content store)
  const existingEligibility = (existing.eligibilityRules as Record<string, unknown>) ?? {};
  const updatedEligibility = {
    ...existingEligibility,
    ...(contentFaqs !== undefined && { faqs: contentFaqs }),
    ...(contentTagline !== undefined && { tagline: contentTagline }),
    ...(contentHeroImages !== undefined && { heroImages: contentHeroImages }),
  };

  const newVersionNumber = existing.versionNumber + 1;

  // Run update + snapshot in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    const policy = await tx.visaPolicy.update({
      where: { id: params.id },
      data: {
        ...(visaCategory && { visaCategory }),
        ...(status && { status }),
        ...(processingTimeMin !== undefined && { processingTimeMin }),
        ...(processingTimeMax !== undefined && { processingTimeMax }),
        ...(processingNotes !== undefined && { processingNotes }),
        ...(requiredDocuments !== undefined && { requiredDocuments }),
        ...(optionalDocuments !== undefined && { optionalDocuments }),
        ...(feeDetails !== undefined && { feeDetails }),
        ...(appointmentNotes !== undefined && { appointmentNotes }),
        ...(biometricsNotes !== undefined && { biometricsNotes }),
        ...(vacNotes !== undefined && { vacNotes }),
        ...(embassyLinks !== undefined && { embassyLinks }),
        eligibilityRules: updatedEligibility,
        versionNumber: newVersionNumber,
        status: status ?? "ACTIVE", // manual edits go live immediately
      },
    });

    // Create a snapshot for audit trail
    await tx.policySnapshot.create({
      data: {
        policyId: params.id,
        versionNumber: newVersionNumber,
        snapshot: body,
        diff: { manual_edit: true, editedBy: session!.user.id },
        changeTypes: ["manual_edit"],
        changeSource: "manual_edit",
        status: "approved", // manual edits are auto-approved
        reviewedById: session!.user.id,
        reviewedAt: new Date(),
        reviewNotes: "Saved via policy editor",
      },
    });

    return policy;
  });

  return NextResponse.json({ policy: updated });
}
