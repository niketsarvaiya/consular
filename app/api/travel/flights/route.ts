import { NextRequest, NextResponse } from "next/server";
import { amadeusGet } from "@/lib/amadeus";

export const runtime = "nodejs";

/**
 * GET /api/travel/flights
 * Proxies Amadeus flight-offers search server-side (hides API keys).
 *
 * Query params:
 *   origin       — IATA airport code, e.g. BOM
 *   destination  — IATA airport code, e.g. DXB
 *   date         — YYYY-MM-DD
 *   adults       — 1–9 (default 1)
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
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

  if (!process.env.AMADEUS_API_KEY) {
    return NextResponse.json(
      { error: "Amadeus API not configured" },
      { status: 503 }
    );
  }

  try {
    const data = await amadeusGet("/v2/shopping/flight-offers", {
      originLocationCode:      origin,
      destinationLocationCode: destination,
      departureDate:           date,
      adults,
      currencyCode:            "INR",
      max:                     "6",
      nonStop:                 "false",
    });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[/api/travel/flights]", err?.message);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
