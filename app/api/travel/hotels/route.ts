import { NextRequest, NextResponse } from "next/server";
import { amadeusGet, cityCodeFor } from "@/lib/amadeus";

export const runtime = "nodejs";

/**
 * GET /api/travel/hotels
 * Two-step Amadeus hotel search:
 *   1. /v1/reference-data/locations/hotels/by-city  → get hotel IDs for city
 *   2. /v3/shopping/hotel-offers                    → get live pricing
 *
 * Query params:
 *   cityCode   — IATA airport code, e.g. DXB (we map to city code internally)
 *   checkIn    — YYYY-MM-DD
 *   checkOut   — YYYY-MM-DD
 *   adults     — 1–4 (default 2)
 */
export async function GET(req: NextRequest) {
  const p        = req.nextUrl.searchParams;
  const airport  = p.get("cityCode");
  const checkIn  = p.get("checkIn");
  const checkOut = p.get("checkOut");
  const adults   = p.get("adults") ?? "2";

  if (!airport || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "cityCode, checkIn, checkOut are required" },
      { status: 400 }
    );
  }

  if (!process.env.AMADEUS_API_KEY) {
    return NextResponse.json(
      { error: "Amadeus API not configured" },
      { status: 503 }
    );
  }

  const cityCode = cityCodeFor(airport);

  try {
    // ── Step 1: find hotels in city ──────────────────────────────────────────
    const listData = await amadeusGet(
      "/v1/reference-data/locations/hotels/by-city",
      {
        cityCode,
        radius:     "10",
        radiusUnit: "KM",
        ratings:    "3,4,5",
        hotelSource: "ALL",
      }
    );

    const hotelIds: string[] = (listData.data ?? [])
      .slice(0, 20)
      .map((h: any) => h.hotelId as string);

    if (hotelIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // ── Step 2: fetch pricing for those hotels ───────────────────────────────
    const offersData = await amadeusGet("/v3/shopping/hotel-offers", {
      hotelIds:     hotelIds.join(","),
      checkInDate:  checkIn,
      checkOutDate: checkOut,
      adults,
      roomQuantity: "1",
      currency:     "INR",
      bestRateOnly: "true",
    });

    return NextResponse.json(offersData);
  } catch (err: any) {
    console.error("[/api/travel/hotels]", err?.message);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
