import { NextResponse } from "next/server";
import { requireOpsRole } from "@/lib/auth/guards";

export const runtime = "nodejs";

/**
 * GET /api/admin/exchange-rates
 * Proxies the free open.er-api.com rates (no key needed, 1500 req/month free).
 * Returns rates relative to INR so the frontend can do: inrAmount = foreignAmount / rate[currency].
 * Cached for 1 hour via Next.js data cache.
 */
export async function GET() {
  const { response } = await requireOpsRole("VIEWER");
  if (response) return response;

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", {
      next: { revalidate: 3600 }, // 1-hour cache
    });

    if (!res.ok) {
      throw new Error(`Exchange rate fetch failed: ${res.status}`);
    }

    const data = await res.json();

    // data.rates is { USD: 0.012, EUR: 0.011, ... } (how much 1 INR is in that currency)
    // We invert so the caller gets: 1 unit of foreign currency = X INR
    const raw: Record<string, number> = data.rates ?? {};
    const invertedRates: Record<string, number> = {};
    for (const [cur, rate] of Object.entries(raw)) {
      if (rate > 0) invertedRates[cur] = Math.round((1 / rate) * 100) / 100;
    }

    return NextResponse.json({
      base: "INR",
      lastUpdated: data.time_last_update_utc ?? new Date().toUTCString(),
      rates: invertedRates, // 1 USD = X INR, 1 EUR = X INR, etc.
    });
  } catch (err: any) {
    console.error("[exchange-rates]", err.message);
    // Return hardcoded fallback rates so the UI never breaks
    return NextResponse.json({
      base: "INR",
      lastUpdated: "fallback",
      rates: {
        USD: 83.5, EUR: 90.2, GBP: 105.8, AED: 22.7, SGD: 61.8,
        THB: 2.35, AUD: 54.3, CAD: 61.1, JPY: 0.55, NZD: 49.5,
        MYR: 17.8, IDR: 0.0053, VND: 0.0033, KES: 0.61, ZAR: 4.5,
        TRY: 2.6, EGP: 1.73, INR: 1,
      },
      isFallback: true,
    });
  }
}
