"use client";

import { useState, useCallback } from "react";
import {
  Plane, Hotel, Search, ExternalLink,
  MessageCircle, ChevronDown, ChevronUp,
  AlertCircle, Loader2,
} from "lucide-react";
import type { ExploreCountry } from "@/lib/explore-data";

// ── IATA airport codes for each Consular destination ────────────────────────
const IATA_BY_ISO2: Record<string, string> = {
  TH: "BKK", SG: "SIN", JP: "NRT", GB: "LHR", AU: "SYD",
  CA: "YYZ", AE: "DXB", EG: "CAI", NZ: "AKL", US: "JFK",
  DE: "FRA", IT: "FCO", LK: "CMB", MY: "KUL", ID: "CGK",
  VN: "SGN", KR: "ICN", TW: "TPE", HK: "HKG", TR: "IST",
  KE: "NBO", TZ: "DAR", QA: "DOH", OM: "MCT", GE: "TBS",
  KZ: "ALA", UZ: "TAS", PH: "MNL", KH: "PNH", LA: "VTE",
  MV: "MLE", MU: "MRU", AZ: "GYD", RS: "BEG", FR: "CDG",
  ES: "MAD", NL: "AMS", PT: "LIS", GR: "ATH", AT: "VIE",
  CH: "ZRH", CZ: "PRG", HU: "BUD", PL: "WAW", BE: "BRU",
  SE: "ARN", DK: "CPH", NO: "OSL", FI: "HEL", HR: "ZAG",
  SK: "BTS",
};

const INDIAN_AIRPORTS = [
  { code: "BOM", city: "Mumbai" },
  { code: "DEL", city: "Delhi" },
  { code: "BLR", city: "Bengaluru" },
  { code: "HYD", city: "Hyderabad" },
  { code: "MAA", city: "Chennai" },
  { code: "CCU", city: "Kolkata" },
  { code: "COK", city: "Kochi" },
  { code: "AMD", city: "Ahmedabad" },
];

const AIRLINES: Record<string, string> = {
  AI: "Air India", "6E": "IndiGo", UK: "Vistara",  SG: "SpiceJet",
  EK: "Emirates",  QR: "Qatar Airways", EY: "Etihad",
  SQ: "Singapore Airlines", TK: "Turkish Airlines",
  LH: "Lufthansa", BA: "British Airways", AF: "Air France",
  KL: "KLM",       MH: "Malaysia Airlines", TG: "Thai Airways",
  CX: "Cathay Pacific", GA: "Garuda Indonesia",
  VN: "Vietnam Airlines", OZ: "Asiana Airlines",
  KE: "Korean Air", JL: "Japan Airlines", NH: "ANA",
  WY: "Oman Air",  QF: "Qantas", NZ: "Air New Zealand",
  FZ: "flydubai",  G9: "Air Arabia", PC: "Pegasus Airlines",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
// Sky Scrapper returns duration in minutes as a number
function parseMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// Sky Scrapper prices are raw USD floats; convert to INR for display
function fmtUSD(raw: number): string {
  const inr = Math.round(raw * 84);
  return `₹${inr.toLocaleString("en-IN")}`;
}

function dateAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function mmtFlightLink(
  from: string, to: string, date: string, adults: string
): string {
  const [y, m, day] = date.split("-");
  return `https://www.makemytrip.com/flights/search?from=${from}&to=${to}&depDate=${day}%2F${m}%2F${y}&flightType=O&class=E&adults=${adults}&children=0&infants=0&searchType=SR`;
}

function bookingLink(
  city: string, checkIn: string, checkOut: string, adults: string
): string {
  return (
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}` +
    `&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=1&group_children=0&sb=1`
  );
}

function waLink(countryName: string, originCity: string, date: string): string {
  const phone = process.env.NEXT_PUBLIC_AGENCY_WHATSAPP ?? "919999999999";
  const msg = `Hi! Planning a trip to ${countryName} from ${originCity} around ${date}. Need help booking flights & hotels. Can you assist?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// ── Component ────────────────────────────────────────────────────────────────
export function TravelSearch({ country }: { country: ExploreCountry }) {
  const iataCode = IATA_BY_ISO2[country.iso2];

  const [open,   setOpen]   = useState(false);
  const [tab,    setTab]    = useState<"flights" | "hotels">("flights");

  // Flight form state
  const [origin,     setOrigin]     = useState("BOM");
  const [flightDate, setFlightDate] = useState(dateAhead(14));
  const [adults,     setAdults]     = useState("1");

  // Hotel form state
  const [checkIn,     setCheckIn]     = useState(dateAhead(14));
  const [checkOut,    setCheckOut]    = useState(dateAhead(17));
  const [hotelAdults, setHotelAdults] = useState("2");

  // Results + loading
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[] | null>(null);
  const [hotels,  setHotels]  = useState<any[] | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const doSearchFlights = useCallback(async () => {
    setLoading(true); setError(null); setFlights(null); setHasFetched(false);
    try {
      const res  = await fetch(`/api/travel/flights?origin=${origin}&destination=${iataCode}&date=${flightDate}&adults=${adults}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Sky Scrapper: { status, data: { itineraries: [...] } }
      setFlights(data.data?.itineraries ?? []);
      setHasFetched(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [iataCode, origin, flightDate, adults]);

  const doSearchHotels = useCallback(async () => {
    setLoading(true); setError(null); setHotels(null); setHasFetched(false);
    try {
      const res  = await fetch(`/api/travel/hotels?cityCode=${iataCode}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${hotelAdults}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Sky Scrapper: { status, data: { hotels: [...] } }
      setHotels(data.data?.hotels ?? data.data ?? []);
      setHasFetched(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [iataCode, checkIn, checkOut, hotelAdults]);

  // No IATA code for this country → show only agency CTA
  if (!iataCode) {
    return (
      <div className="mt-5 border-t border-slate-100 pt-5">
        <AgencyCTA countryName={country.name} originCity="Mumbai" date={dateAhead(14)} origin="BOM" />
      </div>
    );
  }

  const originCity = INDIAN_AIRPORTS.find((a) => a.code === origin)?.city ?? origin;

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">

      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100">
            <Plane className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Plan your trip</p>
            <p className="text-xs text-slate-500">Flights & hotels to {country.name}</p>
          </div>
        </div>
        {open
          ? <ChevronUp  className="h-4 w-4 flex-shrink-0 text-slate-400" />
          : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">

          {/* ── Tabs ── */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            {(["flights", "hotels"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
                  tab === t
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "flights"
                  ? <Plane  className="h-3.5 w-3.5" />
                  : <Hotel  className="h-3.5 w-3.5" />}
                {t}
              </button>
            ))}
          </div>

          {/* ── Flight form ── */}
          {tab === "flights" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">From</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                  >
                    {INDIAN_AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">To</label>
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 h-[38px]">
                    <span className="text-sm font-semibold text-slate-800">{iataCode}</span>
                    <span className="ml-1.5 truncate text-xs text-slate-400">{country.name}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Departure</label>
                  <input
                    type="date"
                    value={flightDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Adults</label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                  >
                    {[1,2,3,4,5,6].map((n) => (
                      <option key={n} value={String(n)}>{n} adult{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={doSearchFlights}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Search  className="h-4 w-4" />}
                {loading ? "Searching…" : "Search Flights"}
              </button>
            </div>
          )}

          {/* ── Hotel form ── */}
          {tab === "hotels" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Guests</label>
                <select
                  value={hotelAdults}
                  onChange={(e) => setHotelAdults(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none"
                >
                  {[1,2,3,4].map((n) => (
                    <option key={n} value={String(n)}>{n} guest{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={doSearchHotels}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Search  className="h-4 w-4" />}
                {loading ? "Searching…" : "Search Hotels"}
              </button>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
              <p className="text-xs text-red-600">
                {error.includes("not configured")
                  ? "RAPIDAPI_KEY not set — add it to environment variables."
                  : "No results found for this route/date. Try our agency below."}
              </p>
            </div>
          )}

          {/* ── Flight results (Sky Scrapper format) ── */}
          {tab === "flights" && flights !== null && (
            <div className="space-y-2">
              {flights.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No flights found. Try our agency →</p>
              ) : (
                flights.slice(0, 4).map((itinerary: any) => {
                  // Sky Scrapper: itinerary → legs[0] (outbound leg)
                  const leg       = itinerary.legs?.[0];
                  if (!leg) return null;
                  const carrier   = leg.carriers?.marketing?.[0];
                  const airline   = carrier?.name ?? AIRLINES[carrier?.alternateId] ?? "Unknown";
                  const logoUrl   = carrier?.logoUrl as string | undefined;
                  const stops     = leg.stopCount ?? 0;
                  const price     = itinerary.price?.raw ?? 0;
                  const tags: string[] = itinerary.tags ?? [];
                  return (
                    <div key={itinerary.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {logoUrl && (
                              <img src={logoUrl} alt={airline} className="h-4 w-4 rounded object-contain" />
                            )}
                            <p className="truncate text-sm font-bold text-slate-900">{airline}</p>
                            {tags.includes("cheapest") && (
                              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">Cheapest</span>
                            )}
                            {tags.includes("best") && !tags.includes("cheapest") && (
                              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700">Best</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {fmtTime(leg.departure)} → {fmtTime(leg.arrival)}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">{parseMins(leg.durationInMinutes)}</span>
                            <span className={`text-[11px] font-semibold ${stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                              {stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-base font-black text-slate-900">{fmtUSD(price)}</p>
                          <p className="text-[10px] text-slate-400">per person</p>
                        </div>
                      </div>
                      <a
                        href={mmtFlightLink(origin, iataCode, flightDate, adults)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                      >
                        Book on MakeMyTrip <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Hotel results (Sky Scrapper format) ── */}
          {tab === "hotels" && hotels !== null && (
            <div className="space-y-2">
              {hotels.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No hotels found. Try our agency →</p>
              ) : (
                hotels.slice(0, 4).map((hotel: any) => {
                  // Sky Scrapper: hotel is a flat object { name, stars, price, reviewSummary }
                  const stars   = Math.min(hotel.stars ?? hotel.starRating ?? 3, 5);
                  const price   = hotel.price?.raw ?? hotel.rawPrice ?? 0;
                  const review  = hotel.reviewSummary;
                  return (
                    <div key={hotel.hotelId ?? hotel.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 leading-snug">{hotel.name}</p>
                          <p className="text-xs text-amber-500 mt-0.5">{"★".repeat(stars)}</p>
                          {review && (
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {review.score?.toFixed(1)} · {review.scoreDesc ?? "Good"}
                            </p>
                          )}
                        </div>
                        {price > 0 && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-base font-black text-slate-900">{fmtUSD(price)}</p>
                            <p className="text-[10px] text-slate-400">per night</p>
                          </div>
                        )}
                      </div>
                      <a
                        href={bookingLink(country.name, checkIn, checkOut, hotelAdults)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        Book on Booking.com <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Agency CTA ── always visible ── */}
          <AgencyCTA countryName={country.name} originCity={originCity} date={flightDate} origin={origin} />

        </div>
      )}
    </div>
  );
}

// ── Agency CTA sub-component ─────────────────────────────────────────────────
function AgencyCTA({
  countryName, originCity, date, origin,
}: {
  countryName: string; originCity: string; date: string; origin: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">Book via our agency</p>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
            Our travel consultants get exclusive fares + packages — often cheaper than OTAs.
          </p>
        </div>
      </div>
      <a
        href={waLink(countryName, originCity, date)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
      >
        <MessageCircle className="h-4 w-4" />
        Chat on WhatsApp
      </a>
    </div>
  );
}
