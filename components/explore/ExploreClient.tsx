"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Globe, ChevronRight, Map, LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";
import { FilterBar } from "./FilterBar";
import { CountryDrawer } from "./CountryDrawer";
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

const WorldMap = dynamic(
  () => import("./WorldMap").then((m) => ({ default: m.WorldMap })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex w-full items-center justify-center"
        style={{
          minHeight: 580,
          background: "linear-gradient(170deg, #000d1f 0%, #001233 45%, #000d1f 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Globe className="h-9 w-9 animate-pulse text-indigo-500" />
          <span className="text-sm text-slate-400">Loading world map…</span>
        </div>
      </div>
    ),
  }
);

type Filter = VisaStatus | "all";
type Tab = "map" | "grid";

const REGIONS: (Region | "All")[] = [
  "All", "Asia", "Europe", "Middle East", "Africa", "Americas", "Oceania",
];

interface DiscoveryRow {
  title: string;
  subtitle: string;
  items: ExploreCountry[];
  emoji: string;
}

const DISCOVERY_ROWS: DiscoveryRow[] = [
  { title: "Popular destinations",  subtitle: "Where Indians love to travel",      items: POPULAR_DESTINATIONS,  emoji: "🔥" },
  { title: "Trending right now",    subtitle: "Rapidly growing in bookings",        items: TRENDING_DESTINATIONS, emoji: "📈" },
  { title: "Easiest to visit",      subtitle: "Visa-free & on-arrival entry",       items: EASIEST_DESTINATIONS,  emoji: "✈️" },
  { title: "Quick e-Visa",          subtitle: "Apply online in minutes",            items: EVISA_DESTINATIONS,    emoji: "⚡" },
];

export function ExploreClient() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [activeRegion, setActiveRegion] = useState<Region | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<ExploreCountry | null>(null);
  const [tab, setTab] = useState<Tab>("map");
  const gridRef = useRef<HTMLDivElement>(null);

  // Count live destinations per filter
  const filterCounts = useMemo(() => {
    const live = EXPLORE_COUNTRIES.filter((c) => c.hasLivePage);
    return {
      all: live.length,
      visa_free: live.filter((c) => c.visaStatus === "visa_free").length,
      visa_on_arrival: live.filter((c) => c.visaStatus === "visa_on_arrival").length,
      e_visa: live.filter((c) => c.visaStatus === "e_visa").length,
      visa_required: live.filter((c) => c.visaStatus === "visa_required").length,
    } as Partial<Record<Filter, number>>;
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
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-600 mb-4">
              <Globe className="h-4 w-4" />
              {EXPLORE_COUNTRIES.filter((c) => c.hasLivePage).length} destinations · Indian passport
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight sm:text-5xl">
              Explore visa requirements
              <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                for every country
              </span>
            </h1>
            <p className="mt-3 text-base text-slate-500 max-w-lg">
              See at a glance which countries Indian passport holders can enter visa-free, on arrival, or with an e-Visa. Click any country for instant details.
            </p>
          </motion.div>

          {/* Search + tab switcher row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search destinations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Tab switcher */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(["map", "grid"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    tab === t ? "text-slate-900 bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "map" ? <Map className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                  {t === "map" ? "World Map" : "Grid"}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Filter chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="mt-4"
          >
            <FilterBar
              active={activeFilter}
              onChange={setActiveFilter}
              counts={filterCounts}
            />
          </motion.div>
        </div>
      </div>

      {/* ── MAP VIEW — full bleed ──────────────────────────────────── */}
      {tab === "map" && (
        <motion.div
          key="map"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Full-width map — no container */}
          <WorldMap
            activeFilter={activeFilter}
            onCountryClick={setSelectedCountry}
            selectedCountry={selectedCountry}
          />

          {/* Stats bar — contained */}
          <div className="border-b border-slate-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["visa_free", "visa_on_arrival", "e_visa", "visa_required"] as VisaStatus[]).map(
                  (status) => {
                    const meta = VISA_STATUS_META[status];
                    const totalCount = EXPLORE_COUNTRIES.filter((c) => c.visaStatus === status).length;
                    const liveCount = EXPLORE_COUNTRIES.filter((c) => c.visaStatus === status && c.hasLivePage).length;
                    const isActive = activeFilter === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setActiveFilter(isActive ? "all" : status)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-slate-200 ${
                          isActive ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-white"
                        }`}
                      >
                        <span
                          className="h-3 w-3 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: meta.mapColor,
                            boxShadow: `0 0 8px ${meta.mapColor}80`,
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-base font-black text-slate-900 tabular-nums leading-none">
                            {totalCount}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">{meta.label}</p>
                          {liveCount > 0 && (
                            <p className="text-[10px] text-indigo-500 font-medium">{liveCount} bookable</p>
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── GRID VIEW ─────────────────────────────────────────────── */}
      {tab === "grid" && (
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          ref={gridRef}
        >
          {/* Region filter */}
          <div className="mb-5 flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                  activeRegion === region
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-5xl">🔍</p>
              <p className="mt-4 text-lg font-semibold text-slate-700">No destinations found</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters</p>
              <button
                onClick={() => { setActiveFilter("all"); setActiveRegion("All"); setSearchQuery(""); }}
                className="mt-4 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">{filteredDestinations.length}</span>{" "}
                destination{filteredDestinations.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredDestinations.map((country, i) => (
                  <DestinationCard
                    key={country.iso2}
                    country={country}
                    onClick={setSelectedCountry}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── Discovery rows ────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-14">
          {DISCOVERY_ROWS.map((row) => {
            if (row.items.length === 0) return null;
            return (
              <section key={row.title}>
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {row.emoji} {row.title}
                    </h2>
                    <p className="text-sm text-slate-500">{row.subtitle}</p>
                  </div>
                  <button
                    className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    onClick={() => {
                      setTab("grid");
                      setTimeout(
                        () => gridRef.current?.scrollIntoView({ behavior: "smooth" }),
                        100
                      );
                    }}
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {row.items.slice(0, 5).map((country, i) => (
                    <DestinationCard
                      key={country.iso2}
                      country={country}
                      onClick={setSelectedCountry}
                      index={i}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Country drawer */}
      <CountryDrawer
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
      />
    </div>
  );
}
