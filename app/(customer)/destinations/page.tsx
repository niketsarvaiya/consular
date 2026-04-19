"use client";
import Link from "next/link";
import { ArrowRight, Clock, Search } from "lucide-react";
import { useEffect, useState } from "react";

const VISA_CATEGORY_LABELS: Record<string, string> = {
  REQUIRED: "Sticker Visa",
  E_VISA: "e-Visa",
  ETA: "ETA",
  VISA_EXEMPT: "Visa-free",
};

const VISA_CATEGORY_COLORS: Record<string, string> = {
  REQUIRED: "bg-purple-50 text-purple-700",
  E_VISA: "bg-blue-50 text-blue-700",
  ETA: "bg-amber-50 text-amber-700",
  VISA_EXEMPT: "bg-emerald-50 text-emerald-700",
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

export default function DestinationsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        setCountries(d.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const q = query.toLowerCase().trim();
  const filtered = q ? countries.filter((c) => c.name.toLowerCase().includes(q)) : countries;
  const available = filtered.filter((c) => c.policies.length > 0);
  const comingSoon = filtered.filter((c) => c.policies.length === 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Destinations</h1>
        <p className="mt-1.5 text-slate-500">
          Visa assistance for Indian passport holders across{" "}
          <span className="font-medium text-slate-700">{loading ? "…" : countries.filter((c) => c.policies.length > 0).length} destinations</span>.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-10 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
        </div>
      ) : (
        <>
          {/* Available destinations */}
          {available.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Available now · {available.length}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((country) => (
                  <div
                    key={country.id}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Country header */}
                    <div className="flex items-center gap-3 mb-4">
                      {country.flagUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={country.flagUrl}
                          alt=""
                          className="h-7 w-10 rounded-sm object-cover shadow-sm"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900 leading-tight">{country.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {country.policies.length} visa type{country.policies.length > 1 ? "s" : ""} available
                        </p>
                      </div>
                    </div>

                    {/* Visa options */}
                    <div className="space-y-2">
                      {country.policies.map((policy) => {
                        const fee = policy.feeDetails;
                        const totalFee = fee ? fee.governmentFeeINR + fee.serviceFeeINR : 0;
                        return (
                          <Link
                            key={policy.visaType}
                            href={`/apply/${country.code.toLowerCase()}/${policy.visaType.toLowerCase()}`}
                            className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-slate-900">
                                  {policy.visaType === "TOURIST" ? "Tourist" : "Business"} Visa
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    VISA_CATEGORY_COLORS[policy.visaCategory] ?? "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {VISA_CATEGORY_LABELS[policy.visaCategory] ?? policy.visaCategory}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                                {policy.processingTimeMin && policy.processingTimeMax ? (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {policy.processingTimeMin}–{policy.processingTimeMax} days
                                  </span>
                                ) : null}
                                {totalFee > 0 ? (
                                  <span className="font-medium text-slate-600">
                                    From ₹{totalFee.toLocaleString("en-IN")}
                                  </span>
                                ) : (
                                  <span className="font-medium text-emerald-600">No visa fee</span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-600" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {available.length === 0 && q && (
            <p className="py-8 text-center text-sm text-slate-400">No available destinations match &ldquo;{query}&rdquo;.</p>
          )}

          {/* Coming soon — compact chips, not full cards */}
          {comingSoon.length > 0 && !q && (
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Coming soon · {comingSoon.length}
              </h2>
              <div className="flex flex-wrap gap-2">
                {comingSoon.map((country) => (
                  <div
                    key={country.id}
                    className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-sm text-slate-400"
                  >
                    {country.flagUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={country.flagUrl} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
                    )}
                    {country.name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Search result for coming-soon countries */}
          {comingSoon.length > 0 && q && (
            <section className="mt-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Not yet available
              </h2>
              <div className="flex flex-wrap gap-2">
                {comingSoon.map((country) => (
                  <div
                    key={country.id}
                    className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-sm text-slate-400"
                  >
                    {country.flagUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={country.flagUrl} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
                    )}
                    {country.name}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <p className="mt-16 text-center text-xs text-slate-400">
        All visa types are for Indian passport holders only.
      </p>
    </div>
  );
}
