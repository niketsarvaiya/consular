import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { updateApplicationStatus } from "@/lib/services/application.service";
import { updateCaseStatusSchema } from "@/lib/utils/validators";
import { enqueueNotification } from "@/lib/services/notification.service";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireOpsRole("OPS");
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = updateCaseStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await updateApplicationStatus(
      params.id,
      parsed.data.status,
      session!.user.id,
      parsed.data.notes
    );

    // Notify customer of status change
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });

    if (application?.customer) {
      await enqueueNotification({
        eventType: "case_update",
        customerId: application.customerId,
        applicationId: params.id,
        channel: "EMAIL",
        recipient: application.customer.email,
        templateVars: {
          customerName: application.customer.fullName,
          newStatus: parsed.data.status.replace(/_/g, " "),
          applicationId: params.id,
          message: parsed.data.notes ?? "",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin case status PATCH]", error);
    return NextResponse.json({ success: false, error: "Failed to update status." }, { status: 500 });
  }
}
