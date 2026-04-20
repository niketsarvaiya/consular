"use client";
import Link from "next/link";
import { ArrowRight, Clock, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { COUNTRY_HERO_IMAGES } from "@/lib/visa-content";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";

const VISA_CATEGORY_LABELS: Record<string, string> = {
  REQUIRED: "Sticker Visa",
  E_VISA: "e-Visa",
  ETA: "ETA",
  VISA_EXEMPT: "Visa-free",
};

const VISA_CATEGORY_COLORS: Record<string, string> = {
  REQUIRED: "bg-purple-500/80 text-white",
  E_VISA: "bg-blue-500/80 text-white",
  ETA: "bg-amber-500/80 text-white",
  VISA_EXEMPT: "bg-emerald-500/80 text-white",
};

type Policy = {
  visaType: string;
  visaCategory: string;
  processingTimeMin: number | null;
  processingTimeMax: number | null;
  feeDetails: { governmentFeeINR: number; serviceFeeINR: number } | null;
};

type Country = {
  id: string;
  name: string;
  code: string;
  flagUrl: string | null;
  policies: Policy[];
};

const FILTER_TABS = [
  { label: "All", value: "ALL" },
  { label: "e-Visa", value: "E_VISA" },
  { label: "Sticker Visa", value: "REQUIRED" },
  { label: "Visa-free", value: "VISA_EXEMPT" },
];

// Preferred display order — most popular for Indian travellers first
const SORT_ORDER = ["AE","TH","SG","NZ","GB","US","CA","AU","JP","FR","DE","IT","VN","ID","MY","TR","EG","KE"];

export default function DestinationsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const sorted = (d.data ?? []).sort((a: Country, b: Country) => {
          const ai = SORT_ORDER.indexOf(a.code);
          const bi = SORT_ORDER.indexOf(b.code);
          if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        });
        setCountries(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const q = query.toLowerCase().trim();

  const available = countries.filter((c) => c.policies.length > 0);
  const comingSoon = countries.filter((c) => c.policies.length === 0);

  const filteredAvailable = available.filter((c) => {
    const matchesQuery = !q || c.name.toLowerCase().includes(q);
    const matchesFilter =
      activeFilter === "ALL" ||
      c.policies.some((p) => p.visaCategory === activeFilter);
    return matchesQuery && matchesFilter;
  });

  const filteredComingSoon = comingSoon.filter(
    (c) => !q || c.name.toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Where do you want to go?
          </h1>
          <p className="mt-1.5 text-slate-500">
            Visa assistance for Indian passport holders across{" "}
            <span className="font-semibold text-slate-700">
              {loading ? "…" : available.length} destinations
            </span>{" "}
            — with {comingSoon.length}+ more coming soon.
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any country…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          </div>
        ) : (
          <>
            {/* ── FILTER TABS ── */}
            {!q && (
              <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
                <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveFilter(tab.value)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      activeFilter === tab.value
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                    {tab.value !== "ALL" && !q && (
                      <span className={`ml-1.5 text-[10px] ${activeFilter === tab.value ? "text-indigo-200" : "text-slate-400"}`}>
                        {available.filter((c) => c.policies.some((p) => p.visaCategory === tab.value)).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── AVAILABLE DESTINATIONS — IMAGE CARDS ── */}
            {filteredAvailable.length > 0 && (
              <section className="mb-14">
                {!q && (
                  <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Available now · {filteredAvailable.length}
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredAvailable.map((country) => {
                    const heroImg =
                      COUNTRY_HERO_IMAGES[country.code]?.[0] ?? FALLBACK_IMG;
                    const policy = country.policies[0];
                    const fee = policy?.feeDetails;
                    const totalFee = fee
                      ? fee.governmentFeeINR + fee.serviceFeeINR
                      : 0;
                    const applyPath = `/apply/${country.code.toLowerCase()}/${policy?.visaType.toLowerCase() ?? "tourist"}`;

                    return (
                      <Link
                        key={country.id}
                        href={applyPath}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        style={{ height: "260px" }}
                      >
                        {/* Background image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroImg}
                          alt={country.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

                        {/* Visa type badge — top right */}
                        {policy && (
                          <div className="absolute top-3 right-3">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm ${VISA_CATEGORY_COLORS[policy.visaCategory] ?? "bg-slate-500/80 text-white"}`}>
                              {VISA_CATEGORY_LABELS[policy.visaCategory] ?? policy.visaCategory}
                            </span>
                          </div>
                        )}

                        {/* Country info — bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {/* Flag + name */}
                          <div className="flex items-center gap-2.5 mb-2.5">
                            {country.flagUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={country.flagUrl}
                                alt=""
                                className="h-5 w-7 rounded-[3px] object-cover shadow"
                              />
                            )}
                            <h3 className="text-base font-bold text-white leading-tight">
                              {country.name}
                            </h3>
                          </div>

                          {/* Stats row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {policy?.processingTimeMin && policy?.processingTimeMax && (
                                <span className="flex items-center gap-1 text-[11px] text-white/70">
                                  <Clock className="h-3 w-3" />
                                  {policy.processingTimeMin}–{policy.processingTimeMax}d
                                </span>
                              )}
                              {totalFee > 0 ? (
                                <span className="text-[11px] font-semibold text-white/90">
                                  from ₹{totalFee.toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-emerald-400">
                                  No visa fee
                                </span>
                              )}
                            </div>

                            {/* Apply arrow */}
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm group-hover:bg-indigo-600 transition-colors">
                              <ArrowRight className="h-3.5 w-3.5 text-white" />
                            </div>
                          </div>

                          {/* Multiple visa types indicator */}
                          {country.policies.length > 1 && (
                            <p className="mt-1.5 text-[10px] text-white/50">
                              +{country.policies.length - 1} more visa type{country.policies.length > 2 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty state for filtered results */}
            {filteredAvailable.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-slate-400 text-sm">
                  {q
                    ? `No available destinations match "${query}".`
                    : `No destinations match this filter yet.`}
                </p>
                {(q || activeFilter !== "ALL") && (
                  <button
                    onClick={() => { setQuery(""); setActiveFilter("ALL"); }}
                    className="mt-3 text-xs text-indigo-600 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* ── COMING SOON ── */}
            {filteredComingSoon.length > 0 && (
              <section>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Coming soon · {filteredComingSoon.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {filteredComingSoon.map((country) => (
                    <div
                      key={country.id}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-500 shadow-sm"
                    >
                      {country.flagUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={country.flagUrl}
                          alt=""
                          className="h-3.5 w-5 rounded-[2px] object-cover"
                        />
                      )}
                      {country.name}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer note */}
            <p className="mt-16 text-center text-xs text-slate-400">
              All visa types shown are for Indian passport holders only.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
