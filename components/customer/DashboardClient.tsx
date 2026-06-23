"use client";

import { useState, useMemo, useRef, useEffect, useCallback, type ComponentProps } from "react";
import Link from "next/link";
import {
  Search, X, Plus, Globe2, Plane, ArrowRight, MapPin, Sparkles, ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProfileMap, type PlannedTrip } from "@/components/customer/ProfileMap";
import { ALL_COUNTRIES, COUNTRY_BY_NUMERIC } from "@/lib/countries-data";

export interface DashboardApp {
  id: string;
  ref: string;
  countryName: string;
  flagUrl: string | null;
  visaLabel: string;
  visaType: string;
  status: string;
  required: number;
  approved: number;
  progressPct: number;
  next: { label: string; href: string };
}

interface DashboardClientProps {
  greeting: string;
  firstName: string;
  fullName: string;
  initials: string;
  memberSince: string;
  initialVisited: string[];
  planned: PlannedTrip[];
  apps: DashboardApp[];
}

const WORLD_TOTAL = 195; // sovereign countries

const VISA_TYPE_COLORS: Record<string, string> = {
  TOURIST: "bg-sky-50 text-sky-700 ring-sky-100",
  BUSINESS: "bg-amber-50 text-amber-700 ring-amber-100",
  STUDENT: "bg-violet-50 text-violet-700 ring-violet-100",
  TRANSIT: "bg-slate-100 text-slate-600 ring-slate-200",
};

type BadgeStatus = ComponentProps<typeof StatusBadge>["status"];

function norm(id: string | number): string {
  return String(parseInt(String(id), 10));
}

export function DashboardClient({
  greeting, firstName, fullName, initials, memberSince,
  initialVisited, planned, apps,
}: DashboardClientProps) {
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
      if (willVisit) next.add(geoId); else next.delete(geoId);
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
        if (willVisit) next.delete(geoId); else next.add(geoId);
        return next;
      });
    } finally {
      setSavingId((s) => (s === geoId ? null : s));
    }
  }, []);

  const toggle = useCallback((geoId: string) => {
    const id = norm(geoId);
    persist(id, !visited.has(id));
  }, [persist, visited]);

  const visitedRows = useMemo(
    () => Array.from(visited).map((n) => COUNTRY_BY_NUMERIC[norm(n)]).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)),
    [visited]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_COUNTRIES.filter((c) => !visited.has(norm(c.n)) && c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, visited]);

  const worldPct = Math.round((visitedRows.length / WORLD_TOTAL) * 100);

  // Primary (active) application = first non-closed, else first
  const primary = apps.find((a) => a.status !== "CLOSED") ?? apps[0] ?? null;
  const others = apps.filter((a) => a.id !== primary?.id);

  return (
    <div className="min-h-screen bg-ivory">
      {/* ───────────────── IMMERSIVE HERO ───────────────── */}
      <section className="relative h-[460px] w-full overflow-hidden sm:h-[540px]">
        <ProfileMap visited={visited} onToggle={toggle} planned={planned} savingId={savingId} editable />

        {/* vignettes */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-slate-950/85 via-slate-950/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ivory via-ivory/40 to-transparent" />

        {/* headline */}
        <div className="pointer-events-none absolute left-0 top-0 px-5 pt-7 sm:px-10 sm:pt-10">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300">
            <Sparkles className="h-3.5 w-3.5" /> Your travel atlas
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white drop-shadow sm:text-5xl">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-300 sm:text-base">
            {visitedRows.length > 0
              ? <>You&apos;ve explored <span className="font-semibold text-white">{visitedRows.length}</span> {visitedRows.length === 1 ? "country" : "countries"}. The world&apos;s still waiting.</>
              : <>Mark the places you&apos;ve been — start building your map below.</>}
          </p>
        </div>

        {/* glass search-to-add (top right) */}
        <div ref={boxRef} className="absolute right-5 top-7 z-20 w-[min(320px,calc(100%-2.5rem))] sm:right-10 sm:top-10">
          <div className={`flex items-center gap-2 rounded-2xl border bg-white/10 px-3.5 py-2.5 backdrop-blur-md transition-colors ${open ? "border-white/40 bg-white/15" : "border-white/15"}`}>
            <Search className="h-4 w-4 shrink-0 text-white/70" />
            <input
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
              placeholder="Add a country you've visited…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {open && results.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">
              {results.map((c) => (
                <button
                  key={c.n}
                  type="button"
                  onClick={() => { persist(norm(c.n), true); setQuery(""); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-gold-50"
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 font-medium text-slate-700">{c.name}</span>
                  <Plus className="h-4 w-4 text-gold-600" />
                </button>
              ))}
            </div>
          )}
          {open && query.trim() && results.length === 0 && (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-2xl">
              No match (or already added).
            </div>
          )}
        </div>

        {/* glass stats (bottom left) */}
        <div className="absolute bottom-7 left-5 z-10 flex items-stretch gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:left-10">
          {[
            { icon: Globe2, label: "Visited", value: visitedRows.length, tint: "text-emerald-300" },
            { icon: Plane, label: "Planned", value: planned.length, tint: "text-gold-300" },
            { icon: MapPin, label: "of world", value: `${worldPct}%`, tint: "text-amber-300" },
          ].map((s) => (
            <div key={s.label} className="px-5 py-3 text-center">
              <s.icon className={`mx-auto mb-1 h-4 w-4 ${s.tint}`} />
              <p className="text-lg font-black leading-none text-white">{s.value}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── CONTENT ───────────────── */}
      <div className="relative z-10 mx-auto -mt-20 max-w-5xl px-4 pb-20 sm:px-6">

        {/* Profile chip row */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ink to-ink-700 text-sm font-bold text-white shadow-lg shadow-ink/30 ring-2 ring-white">
              {initials}
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur">
              <p className="text-sm font-bold leading-tight text-slate-900">{fullName}</p>
              <p className="text-[11px] leading-tight text-slate-400">Traveller since {memberSince}</p>
            </div>
          </div>
          <Link
            href="/destinations"
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-ink/20 transition-all hover:bg-ink-700 hover:shadow-ink/30"
          >
            <Plane className="h-4 w-4" />
            <span className="hidden sm:inline">Plan a new trip</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>

        {/* ── Spotlight active application ── */}
        {primary ? (
          <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
            <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
              {/* accent strip */}
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-500" />

              <div className="flex flex-1 items-center gap-4 pl-2">
                {primary.flagUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={primary.flagUrl} alt={primary.countryName} className="h-16 w-24 shrink-0 rounded-2xl object-cover shadow-md" />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-3xl">🌐</div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-600">Active application</p>
                  <h2 className="mt-0.5 truncate text-xl font-bold text-slate-900">{primary.countryName}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${VISA_TYPE_COLORS[primary.visaType] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                      {primary.visaLabel} Visa
                    </span>
                    <StatusBadge status={primary.status as BadgeStatus} type="application" />
                    <span className="font-mono text-[11px] text-slate-400">#{primary.ref}</span>
                  </div>
                </div>
              </div>

              <Link
                href={primary.next.href}
                className="group flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800"
              >
                {primary.next.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {primary.required > 0 && (
              <div className="border-t border-slate-100 bg-ivory/60 px-6 py-4 sm:px-7">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Document progress</span>
                  <span className="font-semibold text-slate-700">{primary.approved}/{primary.required} approved</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${primary.progressPct}%`,
                      background: primary.progressPct === 100
                        ? "linear-gradient(90deg,#C8892B,#E0AC54)"
                        : "linear-gradient(90deg,#C8892B,#f59e0b)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-gold-200 bg-white px-8 py-16 text-center shadow-sm">
            <div className="text-5xl">🌍</div>
            <h3 className="mt-5 text-xl font-bold text-slate-800">Where would you like to go?</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              Pick a destination and we&apos;ll build your personalised document checklist — so you always know exactly what to prepare.
            </p>
            <Link href="/destinations" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-ink/15 transition-all hover:bg-ink-700">
              Browse destinations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* ── Other applications ── */}
        {others.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">More applications</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {others.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/application/${app.id}`}
                  className="group flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-gold-200 hover:shadow-md"
                >
                  {app.flagUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.flagUrl} alt={app.countryName} className="h-10 w-[56px] shrink-0 rounded-lg object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-10 w-[56px] shrink-0 items-center justify-center rounded-lg bg-slate-100 text-2xl">🌐</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{app.countryName}</p>
                    <div className="mt-1"><StatusBadge status={app.status as BadgeStatus} type="application" /></div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-gold-600" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Your travels ── */}
        <div className="mt-8 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Globe2 className="h-4 w-4 text-emerald-500" /> Your travels
            </h3>
            <span className="text-xs font-medium text-slate-400">
              {visitedRows.length} of {WORLD_TOTAL} countries · {worldPct}% of the world
            </span>
          </div>

          {/* world progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all" style={{ width: `${Math.max(worldPct, 1)}%` }} />
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
                  <button type="button" onClick={() => persist(norm(c.n), false)} aria-label={`Remove ${c.name}`} className="rounded-full p-0.5 text-emerald-400 transition-colors hover:bg-emerald-200/70 hover:text-emerald-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No countries yet — use the search on the map to add the places you&apos;ve been.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
