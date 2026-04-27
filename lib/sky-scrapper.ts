/**
 * lib/sky-scrapper.ts
 * Sky Scrapper (RapidAPI) client — server-side only.
 *
 * Two-step flow for flights and hotels:
 *   1. searchAirport(query) → { skyId, entityId }  (cached 24 h via Next.js fetch cache)
 *   2. searchFlights / searchHotels               (cached 5 min)
 */

const HOST = "sky-scrapper.p.rapidapi.com";
const BASE = `https://${HOST}`;

function headers() {
  return {
    "x-rapidapi-key":  process.env.RAPIDAPI_KEY!,
    "x-rapidapi-host": HOST,
    "Content-Type":    "application/json",
  };
}

// ── Airport / city lookup ────────────────────────────────────────────────────
export interface AirportInfo {
  skyId:    string;
  entityId: string;
  name:     string;
}

/**
 * Resolves an IATA airport code (e.g. "BOM", "DXB") to the Sky Scrapper
 * skyId + entityId pair needed for flight / hotel searches.
 * Result is cached for 24 hours by Next.js data cache.
 */
export async function resolveAirport(iataCode: string): Promise<AirportInfo> {
  const url = `${BASE}/api/v1/flights/searchAirport?query=${encodeURIComponent(iataCode)}&locale=en-US`;

  const res = await fetch(url, {
    headers: headers(),
    next: { revalidate: 86400 }, // cache 24 h
  });

  if (!res.ok) {
    throw new Error(`Airport lookup failed for "${iataCode}": ${res.status}`);
  }

  const data = await res.json();
  const hits: any[] = data.data ?? [];

  // Prefer exact IATA match; fall back to first result
  const match =
    hits.find((h) => h.skyId?.toUpperCase() === iataCode.toUpperCase()) ??
    hits[0];

  if (!match) {
    throw new Error(`No airport found for code: ${iataCode}`);
  }

  return {
    skyId:    match.skyId,
    entityId: String(match.entityId),
    name:     match.presentation?.title ?? match.presentation?.suggestionTitle ?? iataCode,
  };
}

// ── Flight search ────────────────────────────────────────────────────────────
export async function searchFlights(params: {
  originIata:      string;
  destinationIata: string;
  date:            string; // YYYY-MM-DD
  adults:          string;
}): Promise<any> {
  const [origin, destination] = await Promise.all([
    resolveAirport(params.originIata),
    resolveAirport(params.destinationIata),
  ]);

  const url = new URL(`${BASE}/api/v2/flights/searchFlightsComplete`);
  url.searchParams.set("originSkyId",        origin.skyId);
  url.searchParams.set("destinationSkyId",   destination.skyId);
  url.searchParams.set("originEntityId",     origin.entityId);
  url.searchParams.set("destinationEntityId",destination.entityId);
  url.searchParams.set("date",               params.date);
  url.searchParams.set("adults",             params.adults);
  url.searchParams.set("cabinClass",         "economy");
  url.searchParams.set("sortBy",             "best");
  url.searchParams.set("currency",           "USD");
  url.searchParams.set("market",             "en-US");
  url.searchParams.set("countryCode",        "IN");

  const res = await fetch(url.toString(), {
    headers: headers(),
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) {
    throw new Error(`Flight search failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

// ── Hotel search ─────────────────────────────────────────────────────────────
export async function searchHotels(params: {
  cityIata:  string;
  checkIn:   string; // YYYY-MM-DD
  checkOut:  string;
  adults:    string;
}): Promise<any> {
  const city = await resolveAirport(params.cityIata);

  const url = new URL(`${BASE}/api/v1/hotels/searchHotels`);
  url.searchParams.set("entityId",    city.entityId);
  url.searchParams.set("checkin",     params.checkIn);
  url.searchParams.set("checkout",    params.checkOut);
  url.searchParams.set("adults",      params.adults);
  url.searchParams.set("rooms",       "1");
  url.searchParams.set("limit",       "8");
  url.searchParams.set("currency",    "USD");
  url.searchParams.set("market",      "en-US");
  url.searchParams.set("countryCode", "IN");

  const res = await fetch(url.toString(), {
    headers: headers(),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Hotel search failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
