import type { PassportOCRResult } from "@/types";

export async function extractPassportData(imageBuffer: Buffer, mimeType: string): Promise<PassportOCRResult> {
  const provider = process.env.OCR_PROVIDER ?? "google";
  try {
    if (provider === "google") return await extractWithGoogleVision(imageBuffer, mimeType);
    throw new Error(`Unsupported OCR provider: ${provider}`);
  } catch (error) {
    console.error("[OCR] Extraction failed:", error);
    return { confidence: {}, rawResponse: { error: String(error) } };
  }
}

async function extractWithGoogleVision(imageBuffer: Buffer, _mimeType: string): Promise<PassportOCRResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_VISION_API_KEY not configured.");

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ image: { content: imageBuffer.toString("base64") }, features: [{ type: "DOCUMENT_TEXT_DETECTION" }] }] }),
  });

  if (!res.ok) throw new Error(`Google Vision API error: ${res.status}`);

  const data = await res.json() as { responses: Array<{ fullTextAnnotation?: { text: string }; error?: { message: string } }> };
  const visionResponse = data.responses[0];
  if (visionResponse?.error) throw new Error(visionResponse.error.message);

  const fullText = visionResponse?.fullTextAnnotation?.text ?? "";
  const parsed = parseMRZ(fullText);
  return { ...parsed, rawResponse: { fullText: fullText.slice(0, 2000) } };
}

function parseMRZ(text: string): Omit<PassportOCRResult, "rawResponse"> {
  const lines = text.split("\n").map((l) => l.replace(/\s/g, "").toUpperCase()).filter((l) => l.length >= 44 && /^[A-Z0-9<]+$/.test(l));
  const mrzLine1 = lines.find((l) => l.startsWith("P<") || l.startsWith("P "));
  const mrzLine2 = lines.find((l) => !l.startsWith("P<") && l.length === 44 && /^[A-Z0-9<]+$/.test(l));
  const confidence: Record<string, number> = {};

  if (!mrzLine1 || !mrzLine2) return { confidence };

  const nationalityFromMRZ = mrzLine1.slice(2, 5).replace(/</g, "");
  const nameParts = mrzLine1.slice(5).split("<<");
  const surname = (nameParts[0] ?? "").replace(/</g, " ").trim();
  const givenNames = (nameParts[1] ?? "").replace(/</g, " ").trim();
  const fullName = `${givenNames} ${surname}`.trim();

  const passportNumber = mrzLine2.slice(0, 9).replace(/</g, "");
  const nationality = mrzLine2.slice(10, 13).replace(/</g, "");
  const dobRaw = mrzLine2.slice(13, 19);
  const expiryRaw = mrzLine2.slice(19, 25);
  const genderChar = mrzLine2[20];
  const gender = genderChar === "M" ? "M" : genderChar === "F" ? "F" : "X";

  const dob = parseMRZDate(dobRaw, true);
  const expiry = parseMRZDate(expiryRaw, false);

  confidence.fullName = fullName ? 0.92 : 0;
  confidence.passportNumber = passportNumber.length >= 6 ? 0.95 : 0;
  confidence.nationality = nationality.length === 3 ? 0.95 : 0;
  confidence.dateOfBirth = dob ? 0.90 : 0;
  confidence.expiryDate = expiry ? 0.90 : 0;
  confidence.gender = 0.90;

  return {
    fullName: fullName || undefined,
    passportNumber: passportNumber || undefined,
    nationality: nationalityFromMRZ || nationality || undefined,
    dateOfBirth: dob?.toISOString() ?? undefined,
    expiryDate: expiry?.toISOString() ?? undefined,
    gender: (gender as "M" | "F" | "X") || undefined,
    mrz: `${mrzLine1}\n${mrzLine2}`,
    confidence,
  };
}

function parseMRZDate(raw: string, isDOB: boolean): Date | null {
  if (raw.length !== 6 || !/^\d{6}$/.test(raw)) return null;
  const yy = parseInt(raw.slice(0, 2));
  const mm = parseInt(raw.slice(2, 4)) - 1;
  const dd = parseInt(raw.slice(4, 6));
  const year = isDOB ? (yy <= 30 ? 2000 + yy : 1900 + yy) : 2000 + yy;
  const date = new Date(year, mm, dd);
  return isNaN(date.getTime()) ? null : date;
}
