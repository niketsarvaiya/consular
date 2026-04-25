"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Globe, ChevronRight } from "lucide-react";
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

// Lazy-load the heavy world map (react-simple-maps + topojson)
const WorldMap = dynamic(
  () => import("./WorldMap").then((m) => ({ default: m.WorldMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center rounded-2xl bg-slate-950 border border-slate-800">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Globe className="h-8 w-8 animate-pulse" />
          <span className="text-sm">Loading world map…</span>
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
  {
    title: "Popular destinations",
    subtitle: "Where Indians love to travel",
    items: POPULAR_DESTINATIONS,
    emoji: "🔥",
  },
  {
    title: "Trending right now",
    subtitle: "Rapidly growing in bookings",
    items: TRENDING_DESTINATIONS,
    emoji: "📈",
  },
  {
    title: "Easiest to visit",
    subtitle: "Visa-free & on-arrival entry",
    items: EASIEST_DESTINATIONS,
    emoji: "✈️",
  },
  {
    title: "Quick e-Visa",
    subtitle: "Apply online in minutes",
    items: EVISA_DESTINATIONS,
    emoji: "⚡",
  },
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
    const liveDests = EXPLORE_COUNTRIES.filter((c) => c.hasLivePage);
    return {
      all: liveDests.length,
      visa_free: liveDests.filter((c) => c.visaStatus === "visa_free").length,
      visa_on_arrival: liveDests.filter((c) => c.visaStatus === "visa_on_arrival").length,
      e_visa: liveDests.filter((c) => c.visaStatus === "e_visa").length,
      visa_required: liveDests.filter((c) => c.visaStatus === "visa_required").length,
    } as Partial<Record<Filter, number>>;
  }, []);

  // Filtered + searched destinations for grid
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

  const handleCountryClick = (country: ExploreCountry) => {
    setSelectedCountry(country);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-sm font-medium text-indigo-600 mb-4">
              <Globe className="h-4 w-4" />
              {EXPLORE_COUNTRIES.filter((c) => c.hasLivePage).length} destinations for Indian passport holders
            </div>
            <h1 className="text-4xl font-black text-slate-900 leading-tight sm:text-5xl">
              Explore the world
              <span className="block text-indigo-600">visa requirements</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-xl">
              Instantly see visa requirements for Indian passport holders. Click any country for details and apply in minutes.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="mt-6 relative max-w-md"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search destinations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </motion.div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Tab switcher */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(["map", "grid"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  tab === t ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-lg bg-indigo-50"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {t === "map" ? "🗺 World Map" : "⊞ Grid View"}
                </span>
              </button>
            ))}
          </div>

          {/* Filter chips */}
          <FilterBar
            active={activeFilter}
            onChange={setActiveFilter}
            counts={filterCounts}
          />
        </div>

        {/* Map view */}
        {tab === "map" && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <WorldMap
              activeFilter={activeFilter}
              onCountryClick={handleCountryClick}
              selectedCountry={selectedCountry}
            />
            {/* Quick stats below map */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {(
                [
                  "visa_free",
                  "visa_on_arrival",
                  "e_visa",
                  "visa_required",
                ] as VisaStatus[]
              ).map((status) => {
                const meta = VISA_STATUS_META[status];
                const count = EXPLORE_COUNTRIES.filter(
                  (c) => c.visaStatus === status
                ).length;
                return (
                  <button
                    key={status}
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === status ? "all" : status
                      )
                    }
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      activeFilter === status
                        ? "border-indigo-200 bg-indigo-50"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: meta.mapColor }}
                    />
                    <div>
                      <p className="text-lg font-black text-slate-900 tabular-nums leading-none">
                        {count}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{meta.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Grid view */}
        {tab === "grid" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
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
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {filteredDestinations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-4xl">🔍</p>
                <p className="mt-4 text-lg font-semibold text-slate-700">
                  No destinations found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setActiveRegion("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{filteredDestinations.length}</span> destination{filteredDestinations.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredDestinations.map((country, i) => (
                    <DestinationCard
                      key={country.iso2}
                      country={country}
                      onClick={handleCountryClick}
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── Discovery rows (always visible) ───────────────────────── */}
        <div className="mt-16 space-y-14">
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
                    className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    onClick={() => {
                      setTab("grid");
                      setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
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
                      onClick={handleCountryClick}
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
