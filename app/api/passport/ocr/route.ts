import { NextRequest, NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { extractPassportData } from "@/lib/services/ocr.service";
import { assertAllowedFile } from "@/lib/security/file-validate";
import { rateLimit, tooManyRequests } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const MAX = 5 * 1024 * 1024;

/**
 * POST /api/passport/ocr — extract passport fields from an uploaded image for
 * autofill. Runs OCR inline (works on Vercel; no background worker needed).
 * Stateless: the image is only used for extraction and is NOT stored here.
 */
export async function POST(req: NextRequest) {
  const { session, response } = await requireCustomer();
  if (response) return response;

  const rl = await rateLimit(`ocr:${session!.user.id}`, 15, 60);
  if (!rl.ok) return NextResponse.json(tooManyRequests(), { status: 429 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ success: false, error: "File exceeds 5MB." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    assertAllowedFile(buffer); // magic-byte check

    const r = await extractPassportData(buffer, file.type || "image/jpeg");

    const data = {
      fullName: r.fullName ?? "",
      passportNumber: r.passportNumber ?? "",
      nationality: r.nationality ?? "",
      dateOfBirth: r.dateOfBirth ? r.dateOfBirth.slice(0, 10) : "", // yyyy-mm-dd
      expiryDate: r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      gender: r.gender ?? "",
      confidence: r.confidence ?? {},
    };

    const extracted = !!(data.fullName || data.passportNumber || data.dateOfBirth);
    return NextResponse.json({ success: true, extracted, data });
  } catch (error) {
    console.error("[passport ocr]", error);
    const message = error instanceof Error ? error.message : "Could not read passport.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
