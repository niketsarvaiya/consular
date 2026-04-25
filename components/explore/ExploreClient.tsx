"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Globe, ChevronRight, ArrowRight,
  Clock, DollarSign, X, ChevronDown, LayoutGrid,
} from "lucide-react";
import dynamic from "next/dynamic";
import { DestinationCard } from "./DestinationCard";
import {
  EXPLORE_COUNTRIES,
  POPULAR_DESTINATIONS,
  TRENDING_DESTINATIONS,
  EASIEST_DESTINATIONS,
  EVISA_DESTINATIONS,
  type ExploreCountry,
  type VisaStatus,
  VISA_STATUS_META,
  type Region,
} from "@/lib/explore-data";
import Link from "next/link";

// ── Lazy-load the heavy map ──────────────────────────────────────────────────
const WorldMap = dynamic(
  () => import("./WorldMap").then((m) => ({ default: m.WorldMap })),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "linear-gradient(170deg, #000d1f 0%, #001233 50%, #000d1f 100%)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Globe className="h-10 w-10 animate-pulse text-indigo-400" />
          <span className="text-sm text-slate-400">Loading world map…</span>
        </div>
      </div>
    ),
  }
);

type Filter = VisaStatus | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "visa_free", label: "Visa Free" },
  { key: "visa_on_arrival", label: "On Arrival" },
  { key: "e_visa", label: "e-Visa" },
  { key: "visa_required", label: "Visa Required" },
];

const REGIONS: (Region | "All")[] = [
  "All", "Asia", "Europe", "Middle East", "Africa", "Americas", "Oceania",
];

const DISCOVERY_ROWS = [
  { title: "🔥 Popular destinations",  subtitle: "Where Indians love to travel",   items: POPULAR_DESTINATIONS },
  { title: "📈 Trending right now",    subtitle: "Rapidly growing in bookings",    items: TRENDING_DESTINATIONS },
  { title: "✈️ Easiest to visit",      subtitle: "Visa-free & on-arrival entry",   items: EASIEST_DESTINATIONS },
  { title: "⚡ Quick e-Visa",          subtitle: "Apply online in minutes",        items: EVISA_DESTINATIONS },
];

// Dark panel helper — matches the map's slate palette
const panel = (border = "#1e293b") => ({
  background: "rgba(15,23,42,0.88)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: `1px solid ${border}`,
});

export function ExploreClient() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [activeRegion, setActiveRegion] = useState<Region | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<ExploreCountry | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const discoveryRef = useRef<HTMLDivElement>(null);

  // Live counts
  const counts = useMemo(() => {
    const live = EXPLORE_COUNTRIES.filter((c) => c.hasLivePage);
    return {
      all: live.length,
      visa_free: live.filter((c) => c.visaStatus === "visa_free").length,
      visa_on_arrival: live.filter((c) => c.visaStatus === "visa_on_arrival").length,
      e_visa: live.filter((c) => c.visaStatus === "e_visa").length,
      visa_required: live.filter((c) => c.visaStatus === "visa_required").length,
    } as Record<Filter, number>;
  }, []);

  const filteredDestinations = useMemo(() => {
    return EXPLORE_COUNTRIES.filter((c) => {
      if (!c.hasLivePage) return false;
      if (activeFilter !== "all" && c.visaStatus !== activeFilter) return false;
      if (activeRegion !== "All" && c.region !== activeRegion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.region.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activeFilter, activeRegion, searchQuery]);

  return (
    <div>
      {/* ── GOOGLE EARTH SECTION — fills viewport under nav ───────── */}
      <div className="relative" style={{ height: "calc(100vh - 64px)" }}>

        {/* Map fills everything */}
        <WorldMap
          activeFilter={activeFilter}
          onCountryClick={setSelectedCountry}
          selectedCountry={selectedCountry}
        />

        {/* ── TOP FLOATING BAR — search + filters ─────────────────── */}
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-2 pointer-events-none">
          {/* Search + filter unified bar */}
          <div className="flex justify-center">
            <div
              className="flex flex-col gap-2 rounded-2xl px-3 py-3 shadow-2xl pointer-events-auto w-full max-w-xl"
              style={panel("#334155")}
            >
              {/* Search input */}
              <div className="flex items-center gap-2.5 px-1">
                <Search className="h-4 w-4 flex-shrink-0 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search any country…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-100 placeholder-slate-600 outline-none"
                />
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <Globe className="h-3 w-3" />
                  <span>{counts.all}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-800 mx-1" />

              {/* Filter chips */}
              <div className="flex flex-wrap gap-1.5 px-1">
                {FILTERS.map(({ key, label }) => {
                  const isActive = activeFilter === key;
                  const meta = key !== "all" ? VISA_STATUS_META[key as VisaStatus] : null;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveFilter(key)}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95"
                      style={
                        isActive
                          ? {
                              background: meta ? `${meta.mapColor}22` : "#1e293b",
                              color: meta?.mapColor ?? "#e2e8f0",
                              border: `1px solid ${meta?.mapColor ?? "#475569"}55`,
                            }
                          : {
                              background: "transparent",
                              color: "#64748b",
                              border: "1px solid transparent",
                            }
                      }
                    >
                      {meta && (
                        <span
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: meta.mapColor }}
                        />
                      )}
                      {label}
                      {counts[key] !== undefined && (
                        <span className="ml-0.5 tabular-nums" style={{ opacity: 0.5 }}>
                          {counts[key]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── FLOATING COUNTRY CARD — bottom left ──────────────────── */}
        <AnimatePresence>
          {selectedCountry && (
            <motion.div
              key={selectedCountry.iso2}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="absolute bottom-6 left-4 z-30 w-72 overflow-hidden rounded-2xl shadow-2xl"
              style={panel("#334155")}
            >
              {/* Hero image */}
              {selectedCountry.heroImage && (
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={selectedCountry.heroImage}
                    alt={selectedCountry.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-2.5 left-3">
                    <p className="text-base font-black text-white leading-tight">
                      {selectedCountry.flag} {selectedCountry.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3.5">
                {!selectedCountry.heroImage && (
                  <div className="mb-2.5 flex items-start justify-between">
                    <p className="text-base font-black text-white">
                      {selectedCountry.flag} {selectedCountry.name}
                    </p>
                    <button onClick={() => setSelectedCountry(null)} className="text-slate-500 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Status badge */}
                {(() => {
                  const meta = VISA_STATUS_META[selectedCountry.visaStatus];
                  return (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold mb-3"
                      style={{ backgroundColor: `${meta.mapColor}20`, color: meta.mapColor, border: `1px solid ${meta.mapColor}40` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.mapColor }} />
                      {meta.label}
                    </div>
                  );
                })()}

                {/* Quick stats */}
                <div className="flex gap-3 mb-3">
                  {selectedCountry.processingDays && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                      {selectedCountry.processingDays}
                    </div>
                  )}
                  {selectedCountry.totalFeeINR !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                      {selectedCountry.totalFeeINR === 0
                        ? "Free"
                        : `from ₹${selectedCountry.totalFeeINR.toLocaleString("en-IN")}`}
                    </div>
                  )}
                </div>

                {/* CTA */}
                {selectedCountry.hasLivePage && selectedCountry.slug ? (
                  <Link
                    href={`/apply/${selectedCountry.slug}/tourist`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "#4f46e5" }}
                    onClick={() => setSelectedCountry(null)}
                  >
                    Apply now <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <div
                    className="rounded-xl py-2.5 text-center text-xs text-slate-600"
                    style={{ background: "#1e293b", border: "1px solid #334155" }}
                  >
                    Coming soon on Consular
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SCROLL DOWN HINT — bottom center ─────────────────────── */}
        {!selectedCountry && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            onClick={() => discoveryRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 text-slate-500 transition-colors hover:text-slate-300"
          >
            <span className="text-xs font-medium tracking-wide">Explore destinations</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
        )}

        {/* ── SEARCH RESULTS OVERLAY — when query active ───────────── */}
        <AnimatePresence>
          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-[82px] z-40 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl shadow-2xl"
              style={panel()}
            >
              {filteredDestinations.length === 0 ? (
                <div className="p-5 text-center text-sm text-slate-500">
                  No destinations found for "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto p-2">
                  {filteredDestinations.slice(0, 8).map((c) => {
                    const meta = VISA_STATUS_META[c.visaStatus];
                    return (
                      <button
                        key={c.iso2}
                        onClick={() => { setSelectedCountry(c); setSearchQuery(""); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <span className="text-xl leading-none">{c.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.region}</p>
                        </div>
                        <span
                          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: `${meta.mapColor}25`, color: meta.mapColor }}
                        >
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                  {filteredDestinations.length > 8 && (
                    <p className="px-3 py-2 text-center text-[11px] text-slate-600">
                      +{filteredDestinations.length - 8} more results
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DISCOVERY SECTION — below the viewport map ────────────── */}
      <div ref={discoveryRef} className="bg-slate-50">
        {/* Grid toggle header */}
        <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Browse destinations</h2>
              <p className="text-sm text-slate-500">
                {counts.all} destinations · Indian passport holders
              </p>
            </div>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                showGrid
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              {showGrid ? "Hide grid" : "Show all destinations"}
            </button>
          </div>
        </div>

        {/* Full grid (toggle) */}
        <AnimatePresence>
          {showGrid && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden border-b border-slate-100 bg-white"
            >
              <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
                {/* Region filter */}
                <div className="mb-5 flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      onClick={() => setActiveRegion(region)}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                        activeRegion === region
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                <p className="mb-4 text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">{filteredDestinations.length}</span>{" "}
                  destinations
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {filteredDestinations.map((c, i) => (
                    <DestinationCard
                      key={c.iso2}
                      country={c}
                      onClick={(country) => {
                        setSelectedCountry(country);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discovery rows */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-14">
          {DISCOVERY_ROWS.map((row) => {
            if (row.items.length === 0) return null;
            return (
              <section key={row.title}>
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{row.title}</h2>
                    <p className="text-sm text-slate-500">{row.subtitle}</p>
                  </div>
                  <button
                    className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    onClick={() => {
                      setShowGrid(true);
                      setTimeout(() => discoveryRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                    }}
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {row.items.slice(0, 5).map((c, i) => (
                    <DestinationCard
                      key={c.iso2}
                      country={c}
                      onClick={(country) => {
                        setSelectedCountry(country);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
