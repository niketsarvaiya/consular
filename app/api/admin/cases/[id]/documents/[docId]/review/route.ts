import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { reviewChecklistItem } from "@/lib/services/checklist.service";
import { z } from "zod";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().max(500).optional(),
  internalNote: z.string().max(500).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const { session, response } = await requireOpsRole("OPS");
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await reviewChecklistItem(
      params.docId,
      parsed.data.action,
      session!.user.id,
      {
        rejectionReason: parsed.data.rejectionReason,
        internalNote: parsed.data.internalNote,
      }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[doc review PATCH]", error);
    return NextResponse.json({ success: false, error: "Review failed." }, { status: 500 });
  }
}
