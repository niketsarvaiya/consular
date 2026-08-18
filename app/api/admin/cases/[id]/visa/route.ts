import { NextRequest, NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";
import { uploadVisaDocument, getVisaDownloadUrl } from "@/lib/services/visa.service";

export const runtime = "nodejs";

const MAX = 10 * 1024 * 1024;

// GET — ops fetches a signed URL to view the currently attached visa
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { response } = await requireOpsRole("VIEWER");
  if (response) return response;

  const visa = await getVisaDownloadUrl(params.id);
  return NextResponse.json({ success: true, data: visa });
}

// POST — ops uploads the issued visa document received from the embassy
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await requireOpsRole("OPS");
  if (response) return response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ success: false, error: "File exceeds 10MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadVisaDocument({
      applicationId: params.id,
      buffer,
      originalName: file.name,
      mimeType: file.type,
      opsUserId: session!.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[visa upload]", error);
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
