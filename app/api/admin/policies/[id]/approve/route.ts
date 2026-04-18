import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { approvePolicySnapshot } from "@/lib/services/policy.service";
import { z } from "zod";

const approveSchema = z.object({
  snapshotId: z.string().cuid(),
  reviewNotes: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireOpsRole("ADMIN");
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = approveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await approvePolicySnapshot(
      parsed.data.snapshotId,
      session!.user.id,
      parsed.data.reviewNotes
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[policy approve POST]", error);
    const message = error instanceof Error ? error.message : "Approval failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
