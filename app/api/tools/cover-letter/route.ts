import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth/guards";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/security/rate-limit";
import { COVER_LETTER_SYSTEM_PROMPT } from "@/lib/tools/cover-letter-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const travelerSchema = z.object({
  full_name: z.string().min(1),
  passport_number: z.string().min(1),
  address: z.string().optional().nullable(),
  is_minor: z.boolean().default(false),
  guardian_full_name: z.string().optional().nullable(),
  guardian_passport_number: z.string().optional().nullable(),
  employment_type: z.string().optional().nullable(),
  employer_or_business_name: z.string().optional().nullable(),
  designation_or_field: z.string().optional().nullable(),
  funding: z.object({
    type: z.string().optional().nullable(),
    sponsor_full_name: z.string().optional().nullable(),
    sponsor_relationship: z.string().optional().nullable(),
  }).optional(),
  companions: z.array(z.object({
    full_name: z.string(),
    passport_number: z.string(),
    relationship: z.string(),
  })).default([]),
});

const bodySchema = z.object({
  destination_country: z.string().min(1),
  visa_type: z.string().min(1),
  visa_purpose: z.string().default("TOURISM"),
  travel_dates: z.object({ departure: z.string().min(1), return: z.string().min(1) }),
  itinerary: z.array(z.object({ date_range: z.string(), location: z.string() })).default([]),
  embassy_or_consulate: z.string().optional().nullable(),
  additional_notes: z.string().max(2000).optional().nullable(),
  travelers: z.array(travelerSchema).min(1).max(8),
});

export async function POST(req: NextRequest) {
  const { response } = await requireCustomer();
  if (response) return response;

  // LLM calls cost money — cap per IP.
  const rl = await rateLimit(`cover-letter:${clientIp(req)}`, 10, 3600);
  if (!rl.ok) return NextResponse.json(tooManyRequests("Letter limit reached. Please try again in an hour."), { status: 429 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Letter generation is not configured yet. Please contact support." },
      { status: 503 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Please complete the required fields." }, { status: 400 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 8000,
      system: COVER_LETTER_SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(parsed.data) }],
    }),
  });

  if (!res.ok) {
    console.error("[cover-letter] anthropic error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ success: false, error: "Could not generate the letters. Please try again." }, { status: 502 });
  }

  const raw = (await res.json())?.content?.[0]?.text ?? "";
  const letters = parseLetters(raw);
  if (!letters.length) {
    return NextResponse.json({ success: false, error: "The generated response could not be read. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true, data: { letters } });
}

/** Model is told to return raw JSON, but tolerate a ```json fence around it. */
function parseLetters(raw: string): { traveler: string; letter_markdown: string }[] {
  const json = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    const parsed = JSON.parse(json);
    const list = Array.isArray(parsed) ? parsed : parsed?.letters;
    if (!Array.isArray(list)) return [];
    return list
      .filter((l) => l && typeof l.letter_markdown === "string")
      .map((l) => ({ traveler: String(l.traveler ?? "Applicant"), letter_markdown: l.letter_markdown }));
  } catch {
    return [];
  }
}
