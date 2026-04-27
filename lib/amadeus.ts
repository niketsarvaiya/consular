/**
 * lib/amadeus.ts
 * Lightweight Amadeus API client — server-side only.
 * Uses module-level token cache so the OAuth2 token is reused across requests
 * for the full 30-minute lifetime rather than fetching a new one every call.
 */

const BASE =
  process.env.AMADEUS_ENV === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";

// ── Token cache ──────────────────────────────────────────────────────────────
let _token = "";
let _expiresAt = 0; // unix ms

async function getToken(): Promise<string> {
  if (_token && Date.now() < _expiresAt) return _token;

  const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_API_KEY!,
      client_secret: process.env.AMADEUS_API_SECRET!,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Amadeus auth failed ${res.status}: ${txt}`);
  }

  const d = await res.json();
  _token = d.access_token;
  // Expire 60 s early to avoid edge-case expiry mid-request
  _expiresAt = Date.now() + (d.expires_in - 60) * 1000;
  return _token;
}

// ── Generic GET helper ───────────────────────────────────────────────────────
export async function amadeusGet(
  path: string,
  params: Record<string, string>
): Promise<any> {
  const tk = await getToken();
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${tk}` },
    // Cache each unique search for 5 min to avoid hammering the API
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Amadeus ${path} → ${res.status}: ${txt}`);
  }

  return res.json();
}

// ── City code mapping (Amadeus hotel search uses IATA city codes) ────────────
// Airport code differs from city code for major multi-airport cities
export const IATA_CITY: Record<string, string> = {
  LHR: "LON", // London
  LGW: "LON",
  CDG: "PAR", // Paris
  ORY: "PAR",
  NRT: "TYO", // Tokyo
  HND: "TYO",
  JFK: "NYC", // New York
  EWR: "NYC",
  LAX: "LAX",
  YYZ: "YTO", // Toronto
  ARN: "STO", // Stockholm
  OSL: "OSL",
  FCO: "ROM", // Rome
  FRA: "FRA",
  // Single-airport cities are the same as airport code
};

export function cityCodeFor(iataAirport: string): string {
  return IATA_CITY[iataAirport] ?? iataAirport;
}
