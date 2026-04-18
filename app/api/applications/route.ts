import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { createApplication, getCustomerApplications } from "@/lib/services/application.service";
import { createApplicationSchema } from "@/lib/utils/validators";

export async function GET() {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const applications = await getCustomerApplications(session!.user.id);
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("[applications GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load applications." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const applicationId = await createApplication(parsed.data, session!.user.id);
    return NextResponse.json({ success: true, data: { applicationId } }, { status: 201 });
  } catch (error) {
    console.error("[applications POST]", error);
    const message = error instanceof Error ? error.message : "Failed to create application.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
