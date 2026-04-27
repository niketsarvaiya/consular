import { NextRequest, NextResponse } from "next/server";
import { searchHotels } from "@/lib/sky-scrapper";

export const runtime = "nodejs";

/**
 * GET /api/travel/hotels
 * Proxies Sky Scrapper hotel search server-side (hides API key).
 *
 * Query params:
 *   cityCode  — IATA airport code for the destination city, e.g. DXB
 *   checkIn   — YYYY-MM-DD
 *   checkOut  — YYYY-MM-DD
 *   adults    — 1–4 (default 2)
 */
export async function GET(req: NextRequest) {
  const p        = req.nextUrl.searchParams;
  const cityCode = p.get("cityCode");
  const checkIn  = p.get("checkIn");
  const checkOut = p.get("checkOut");
  const adults   = p.get("adults") ?? "2";

  if (!cityCode || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "cityCode, checkIn, checkOut are required" },
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
    const data = await searchHotels({ cityIata: cityCode, checkIn, checkOut, adults });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[/api/travel/hotels]", err?.message);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
