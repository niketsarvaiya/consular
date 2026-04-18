import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { uploadChecklistDocument, getApplicationDocuments } from "@/lib/services/document.service";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const documents = await getApplicationDocuments(params.id, { activeOnly: true });
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("[documents GET]", error);
    return NextResponse.json({ success: false, error: "Failed to load documents." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const checklistItemId = formData.get("checklistItemId") as string | null;

    if (!file || !checklistItemId) {
      return NextResponse.json(
        { success: false, error: "file and checklistItemId are required." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const document = await uploadChecklistDocument({
      applicationId: params.id,
      checklistItemId,
      customerId: session!.user.id,
      buffer,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });

    return NextResponse.json({ success: true, data: { documentId: document.id } }, { status: 201 });
  } catch (error) {
    console.error("[documents POST]", error);
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
