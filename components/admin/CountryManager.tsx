"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Globe, CheckCircle2, XCircle, ExternalLink, RefreshCw,
  ChevronDown, AlertTriangle, BookOpen,
} from "lucide-react";

interface CountryPolicy {
  id: string;
  visaType: string;
  status: string;
  lastRefreshedAt: string | null;
}

interface CountryRow {
  id: string;
  code: string;
  name: string;
  flagUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  policyCount: number;
  applicationCount: number;
  policies: CountryPolicy[];
}

interface CountryManagerProps {
  countries: CountryRow[];
}

function policyStatusColor(status: string) {
  if (status === "ACTIVE") return "text-emerald-700 bg-emerald-50";
  if (status === "NEEDS_REVIEW") return "text-amber-700 bg-amber-50";
  if (status === "DRAFT") return "text-blue-700 bg-blue-50";
  return "text-slate-500 bg-slate-50";
}

export function CountryManager({ countries: initial }: CountryManagerProps) {
  const router = useRouter();
  const [countries, setCountries] = useState<CountryRow[]>(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "no_policy">("all");
  const [pending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filtered & searched list
  const visible = useMemo(() => {
    return countries.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ? true :
        filter === "active" ? c.isActive :
        filter === "inactive" ? !c.isActive :
        filter === "no_policy" ? c.policyCount === 0 : true;
      return matchSearch && matchFilter;
    });
  }, [countries, search, filter]);

  const handleToggle = async (country: CountryRow) => {
    const newActive = !country.isActive;
    setTogglingId(country.id);

    // Optimistic update
    setCountries((prev) =>
      prev.map((c) => (c.id === country.id ? { ...c, isActive: newActive } : c))
    );

    try {
      const res = await fetch(`/api/admin/countries/${country.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (!res.ok) throw new Error("Failed");
      startTransition(() => router.refresh());
    } catch {
      // Revert optimistic update
      setCountries((prev) =>
        prev.map((c) => (c.id === country.id ? { ...c, isActive: !newActive } : c))
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search countries…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex gap-1 rounded-xl border border-slate-200 p-1 bg-slate-50">
          {(["all", "active", "inactive", "no_policy"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : f === "inactive" ? "Inactive" : "No policy"}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 ml-auto">
          {visible.length} of {countries.length} countries
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Country</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Policies</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Applications</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                  No countries match your filter
                </td>
              </tr>
            )}
            {visible.map((country) => {
              const isToggling = togglingId === country.id;
              return (
                <tr key={country.id} className={`group hover:bg-slate-50/50 transition-colors ${!country.isActive ? "opacity-60" : ""}`}>
                  {/* Country */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {country.flagUrl ? (
                        <img src={country.flagUrl} alt="" className="h-5 w-7 object-cover rounded-sm shrink-0" />
                      ) : (
                        <Globe className="h-5 w-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{country.name}</p>
                        <p className="text-xs font-mono text-slate-400">{country.code}</p>
                      </div>
                    </div>
                  </td>

                  {/* Active toggle */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggle(country)}
                      disabled={isToggling}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${
                        country.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                      } disabled:opacity-60`}
                    >
                      {isToggling ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : country.isActive ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {country.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Policies */}
                  <td className="px-4 py-4">
                    {country.policies.length === 0 ? (
                      <span className="text-xs text-slate-400">No policies</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {country.policies.map((p) => (
                          <Link
                            key={p.id}
                            href={`/admin/policy/${country.code.toLowerCase()}/${p.visaType.toLowerCase()}`}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-all hover:opacity-80 ${policyStatusColor(p.status)}`}
                          >
                            {p.visaType.charAt(0) + p.visaType.slice(1).toLowerCase()}
                            {p.status === "NEEDS_REVIEW" && <AlertTriangle className="h-3 w-3" />}
                          </Link>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Applications */}
                  <td className="px-4 py-4">
                    <span className={`text-sm font-semibold ${country.applicationCount > 0 ? "text-slate-900" : "text-slate-300"}`}>
                      {country.applicationCount}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {country.policies.length > 0 && (
                        <Link
                          href={`/admin/policy/${country.code.toLowerCase()}/${country.policies[0].visaType.toLowerCase()}`}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Edit policy
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
