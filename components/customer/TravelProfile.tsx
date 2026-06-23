"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, X, Plus, Check, Globe2, Plane, FileCheck2 } from "lucide-react";
import { ProfileMap, type PlannedTrip } from "@/components/customer/ProfileMap";
import { ALL_COUNTRIES, COUNTRY_BY_NUMERIC } from "@/lib/countries-data";

interface TravelProfileProps {
  initialVisited: string[]; // ISO numeric codes
  planned: PlannedTrip[];
  inProgress: number;
}

function norm(id: string | number): string {
  return String(parseInt(String(id), 10));
}

export function TravelProfile({ initialVisited, planned, inProgress }: TravelProfileProps) {
  const [visited, setVisited] = useState<Set<string>>(() => new Set(initialVisited.map(norm)));
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const persist = useCallback(async (geoId: string, willVisit: boolean) => {
    setSavingId(geoId);
    setVisited((prev) => {
      const next = new Set(prev);
      if (willVisit) next.add(geoId);
      else next.delete(geoId);
      return next;
    });
    try {
      const res = await fetch("/api/profile/visited", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geoId, visited: willVisit }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setVisited((prev) => {
        const next = new Set(prev);
        if (willVisit) next.delete(geoId);
        else next.add(geoId);
        return next;
      });
    } finally {
      setSavingId((s) => (s === geoId ? null : s));
    }
  }, []);

  const toggle = useCallback(
    (geoId: string) => {
      const id = norm(geoId);
      persist(id, !visited.has(id));
    },
    [persist, visited]
  );

  const visitedRows = useMemo(() => {
    return Array.from(visited)
      .map((n) => COUNTRY_BY_NUMERIC[norm(n)])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [visited]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_COUNTRIES.filter(
      (c) => !visited.has(norm(c.n)) && c.name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, visited]);

  const stats = [
    { icon: Globe2, label: "Visited", value: visitedRows.length, color: "text-emerald-600" },
    { icon: Plane, label: "Planned", value: planned.length, color: "text-indigo-600" },
    { icon: FileCheck2, label: "In progress", value: inProgress, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Map card ── */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <Globe2 className="h-4 w-4 text-emerald-400" /> Your travel map
          </p>
          <p className="text-[11px] text-slate-400">Tap a country to mark visited</p>
        </div>
        <div className="relative h-[340px] w-full sm:h-[400px]">
          <ProfileMap visited={visited} onToggle={toggle} planned={planned} savingId={savingId} editable />
        </div>

        {/* stats strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <s.icon className={`mx-auto mb-1 h-4 w-4 ${s.color}`} />
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Visited country manager ── */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Globe2 className="h-4 w-4 text-emerald-500" /> Countries you&apos;ve visited
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Search to add, or tap the map. {visitedRows.length} marked.
          </p>
        </div>

        <div ref={boxRef} className="relative">
          <div className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-colors ${open ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200"}`}>
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              placeholder="Search a country to add…"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              {results.map((c) => (
                <button
                  key={c.n}
                  type="button"
                  onClick={() => { persist(norm(c.n), true); setQuery(""); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-indigo-50"
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 font-medium text-slate-700">{c.name}</span>
                  <Plus className="h-4 w-4 text-indigo-500" />
                </button>
              ))}
            </div>
          )}
          {open && query.trim() && results.length === 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-xl">
              No matching country (or already added).
            </div>
          )}
        </div>

        {visitedRows.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {visitedRows.map((c) => (
              <span
                key={c.n}
                className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-emerald-800 transition-opacity ${savingId === norm(c.n) ? "opacity-50" : ""}`}
              >
                <span className="text-sm leading-none">{c.flag}</span>
                {c.name}
                <button
                  type="button"
                  onClick={() => persist(norm(c.n), false)}
                  aria-label={`Remove ${c.name}`}
                  className="rounded-full p-0.5 text-emerald-400 transition-colors hover:bg-emerald-200/70 hover:text-emerald-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-400">
            <Check className="h-3.5 w-3.5" /> No countries added yet — search above to start building your map.
          </div>
        )}
      </div>
    </div>
  );
}
