"use client";

import { useState } from "react";
import {
  Plane, Hotel, MessageCircle,
  ExternalLink, ChevronDown, ChevronUp, ArrowRight,
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

function dateAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Affiliate deep-link builders ─────────────────────────────────────────────

/** MakeMyTrip one-way flight search */
function mmtFlight(from: string, to: string, date: string, adults: string) {
  const [y, m, day] = date.split("-");
  return `https://www.makemytrip.com/flights/search?from=${from}&to=${to}&depDate=${day}%2F${m}%2F${y}&flightType=O&class=E&adults=${adults}&children=0&infants=0&searchType=SR`;
}

/** Google Flights search */
function googleFlight(from: string, to: string, date: string) {
  return `https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}+on+${date}`;
}

/** EaseMyTrip one-way search */
function emtFlight(from: string, to: string, date: string, adults: string) {
  return `https://www.easemytrip.com/flights/search?org=${from}&des=${to}&dd=${date}&ad=${adults}&ch=0&inf=0&cbn=1&tript=O&sCabin=E`;
}

/** Booking.com hotel search */
function bookingHotel(city: string, checkIn: string, checkOut: string, adults: string) {
  return (
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}` +
    `&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=1&group_children=0&sb=1`
  );
}

/** Agoda hotel search */
function agodaHotel(city: string, checkIn: string, checkOut: string, adults: string) {
  const ci = checkIn.replace(/-/g, "/");
  const co = checkOut.replace(/-/g, "/");
  return `https://www.agoda.com/search?city=${encodeURIComponent(city)}&checkIn=${ci}&checkOut=${co}&adults=${adults}&rooms=1`;
}

/** Agency WhatsApp */
function agencyWA(countryName: string, originCity: string, date: string) {
  const phone = process.env.NEXT_PUBLIC_AGENCY_WHATSAPP ?? "919999999999";
  const msg   = `Hi! I'm planning a trip to ${countryName} departing from ${originCity} around ${date}. Can you help with flights & hotels?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// ── Component ────────────────────────────────────────────────────────────────
export function TravelSearch({ country }: { country: ExploreCountry }) {
  const iataCode = IATA_BY_ISO2[country.iso2];

  const [open,       setOpen]       = useState(false);
  const [tab,        setTab]        = useState<"flights" | "hotels">("flights");
  const [origin,     setOrigin]     = useState("BOM");
  const [flightDate, setFlightDate] = useState(dateAhead(14));
  const [adults,     setAdults]     = useState("1");
  const [checkIn,    setCheckIn]    = useState(dateAhead(14));
  const [checkOut,   setCheckOut]   = useState(dateAhead(17));
  const [hotelAdults,setHotelAdults]= useState("2");

  if (!iataCode) {
    return (
      <div className="mt-5 border-t border-slate-100 pt-5">
        <AgencyCTA
          countryName={country.name}
          originCity="Mumbai"
          date={dateAhead(14)}
        />
      </div>
    );
  }

  const originCity = INDIAN_AIRPORTS.find((a) => a.code === origin)?.city ?? origin;

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">

      {/* ── Toggle header ── */}
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
            <p className="text-xs text-slate-500">Flights &amp; hotels to {country.name}</p>
          </div>
        </div>
        {open
          ? <ChevronUp   className="h-4 w-4 flex-shrink-0 text-slate-400" />
          : <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
        }
      </button>

      {open && (
        <div className="mt-3 space-y-3">

          {/* ── Tabs ── */}
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            {(["flights", "hotels"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
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

          {/* ════════════════ FLIGHTS TAB ════════════════ */}
          {tab === "flights" && (
            <div className="space-y-3">

              {/* Form */}
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

              {/* Search on platforms */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Search on
                </p>
                <div className="space-y-2">
                  {[
                    {
                      name: "MakeMyTrip",
                      logo: "🟠",
                      desc: "India's #1 flight booking",
                      href: mmtFlight(origin, iataCode, flightDate, adults),
                      color: "border-orange-200 hover:bg-orange-50",
                      textColor: "text-orange-700",
                    },
                    {
                      name: "Google Flights",
                      logo: "🔵",
                      desc: "Compare all airlines at once",
                      href: googleFlight(origin, iataCode, flightDate),
                      color: "border-blue-200 hover:bg-blue-50",
                      textColor: "text-blue-700",
                    },
                    {
                      name: "EaseMyTrip",
                      logo: "🟢",
                      desc: "No convenience fees",
                      href: emtFlight(origin, iataCode, flightDate, adults),
                      color: "border-emerald-200 hover:bg-emerald-50",
                      textColor: "text-emerald-700",
                    },
                  ].map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 transition-colors ${platform.color}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{platform.logo}</span>
                        <div>
                          <p className={`text-sm font-semibold ${platform.textColor}`}>{platform.name}</p>
                          <p className="text-xs text-slate-400">{platform.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 flex-shrink-0 ${platform.textColor}`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ HOTELS TAB ════════════════ */}
          {tab === "hotels" && (
            <div className="space-y-3">

              {/* Form */}
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
                <div className="col-span-2">
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
              </div>

              {/* Search on platforms */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Search on
                </p>
                <div className="space-y-2">
                  {[
                    {
                      name: "Booking.com",
                      logo: "🔵",
                      desc: "150,000+ hotels worldwide",
                      href: bookingHotel(country.name, checkIn, checkOut, hotelAdults),
                      color: "border-blue-200 hover:bg-blue-50",
                      textColor: "text-blue-700",
                    },
                    {
                      name: "Agoda",
                      logo: "🟣",
                      desc: "Best rates in Asia & beyond",
                      href: agodaHotel(country.name, checkIn, checkOut, hotelAdults),
                      color: "border-violet-200 hover:bg-violet-50",
                      textColor: "text-violet-700",
                    },
                    {
                      name: "MakeMyTrip Hotels",
                      logo: "🟠",
                      desc: "Pay in INR, no forex charges",
                      href: `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${checkIn}&checkout=${checkOut}&city=${encodeURIComponent(country.name)}&adults=${hotelAdults}&children=0`,
                      color: "border-orange-200 hover:bg-orange-50",
                      textColor: "text-orange-700",
                    },
                  ].map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 transition-colors ${platform.color}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{platform.logo}</span>
                        <div>
                          <p className={`text-sm font-semibold ${platform.textColor}`}>{platform.name}</p>
                          <p className="text-xs text-slate-400">{platform.desc}</p>
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 flex-shrink-0 ${platform.textColor}`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Agency CTA — always visible ── */}
          <AgencyCTA
            countryName={country.name}
            originCity={originCity}
            date={flightDate}
          />

        </div>
      )}
    </div>
  );
}

// ── Agency CTA ───────────────────────────────────────────────────────────────
function AgencyCTA({
  countryName, originCity, date,
}: {
  countryName: string; originCity: string; date: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-900">Better rates via our agency</p>
          <p className="mt-0.5 text-xs leading-relaxed text-emerald-700">
            Our travel consultants get exclusive fares &amp; package deals — flights + hotels + visa, all in one.
          </p>
        </div>
      </div>
      <a
        href={agencyWA(countryName, originCity, date)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
      >
        <MessageCircle className="h-4 w-4" />
        Chat on WhatsApp
        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
      </a>
    </div>
  );
}
