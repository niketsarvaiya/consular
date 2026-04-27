import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/sky-scrapper";

export const runtime = "nodejs";

/**
 * GET /api/travel/flights
 * Proxies Sky Scrapper flight search server-side (hides API key).
 *
 * Query params:
 *   origin      — IATA airport code, e.g. BOM
 *   destination — IATA airport code, e.g. DXB
 *   date        — YYYY-MM-DD
 *   adults      — 1–9 (default 1)
 */
export async function GET(req: NextRequest) {
  const p           = req.nextUrl.searchParams;
  const origin      = p.get("origin")      ?? "BOM";
  const destination = p.get("destination");
  const date        = p.get("date");
  const adults      = p.get("adults")      ?? "1";

  if (!destination || !date) {
    return NextResponse.json(
      { error: "destination and date are required" },
      { status: 400 }
    );
  }

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    const data = await searchFlights({ originIata: origin, destinationIata: destination, date, adults });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[/api/travel/flights]", err?.message);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
