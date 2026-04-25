"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  ZoomableGroup,
} from "react-simple-maps";
import { useState, useCallback } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import {
  COUNTRY_BY_NUMERIC,
  VISA_STATUS_META,
  type ExploreCountry,
  type VisaStatus,
} from "@/lib/explore-data";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Base fill for countries we don't track
// All untracked land must be clearly visible against the ocean
const BASE_COUNTRY = "#253555";   // muted blue-grey — land mass, clearly above ocean
const OCEAN_COLOR  = "#0d1b2e";   // deep navy — ocean
const BG_COLOR     = "#0d1b2e";   // same as ocean (bg is the sea)

const HOVER: Record<string, string> = {
  "#059669": "#10b981",
  "#2563eb": "#3b82f6",
  "#7c3aed": "#8b5cf6",
  "#d97706": "#f59e0b",
  "#dc2626": "#ef4444",
  "#253555": "#35527a",  // base country hover
};

const DEFAULT_POSITION = {
  coordinates: [10, 8] as [number, number],
  zoom: 1,
};

interface WorldMapProps {
  activeFilter: VisaStatus | "all";
  onCountryClick: (country: ExploreCountry) => void;
  selectedCountry: ExploreCountry | null;
}

interface TooltipState {
  name: string;
  status: string;
  hasPage: boolean;
  color: string;
  x: number;
  y: number;
}

export function WorldMap({
  activeFilter,
  onCountryClick,
  selectedCountry,
}: WorldMapProps) {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [scrollHint, setScrollHint] = useState(false);

  const getFill = useCallback(
    (geoId: string): string => {
      const c = COUNTRY_BY_NUMERIC[geoId];
      if (!c) return BASE_COUNTRY;
      if (activeFilter !== "all" && c.visaStatus !== activeFilter)
        return "#1a2a42"; // dimmed — slightly above ocean
      return VISA_STATUS_META[c.visaStatus]?.mapColor ?? BASE_COUNTRY;
    },
    [activeFilter]
  );

  const handleMove = useCallback(
    (evt: React.MouseEvent<SVGPathElement>, geoId: string) => {
      const c = COUNTRY_BY_NUMERIC[geoId];
      if (!c) { setTooltip(null); return; }
      const svgEl = (evt.currentTarget as Element).closest("svg");
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      setTooltip({
        name: `${c.flag} ${c.name}`,
        status: VISA_STATUS_META[c.visaStatus]?.label ?? "",
        hasPage: c.hasLivePage,
        color: VISA_STATUS_META[c.visaStatus]?.mapColor ?? BASE_COUNTRY,
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      });
    },
    []
  );

  const filterZoomEvent = useCallback((evt: Event) => {
    if (evt.type === "wheel") {
      setScrollHint(true);
      setTimeout(() => setScrollHint(false), 2000);
      return false;
    }
    return true;
  }, []);

  function zoomIn()  { setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) })); }
  function zoomOut() { setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 0.8) })); }
  function reset()   { setPosition(DEFAULT_POSITION); }

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{ background: BG_COLOR }}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 155 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(p) => setPosition({ coordinates: p.coordinates, zoom: p.zoom })}
          filterZoomEvent={filterZoomEvent as any}
        >
          {/* Subtle latitude/longitude grid — structure without noise */}
          <Graticule stroke="rgba(148,163,184,0.05)" strokeWidth={0.4} />

          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const geoId    = String(parseInt(geo.id, 10));
                const country  = COUNTRY_BY_NUMERIC[geoId];
                const fill     = getFill(geoId);
                const isSelected = selectedCountry?.isoNumeric === geoId;
                const isTracked  = !!country;
                const isDimmed   =
                  activeFilter !== "all" &&
                  isTracked &&
                  country.visaStatus !== activeFilter;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: isSelected ? "#f1f5f9" : fill,
                        stroke: "#0d1b2e",       // ocean color as border = seamless coastlines
                        strokeWidth: 0.5,
                        outline: "none",
                        opacity: isDimmed ? 0.2 : 1,
                        cursor: isTracked ? "pointer" : "default",
                        transition: "fill 0.18s ease, opacity 0.18s ease",
                      },
                      hover: {
                        fill: isSelected
                          ? "#ffffff"
                          : HOVER[fill] ?? (isTracked ? "#35527a" : "#35527a"),
                        stroke: "#0d1b2e",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: isTracked ? "pointer" : "default",
                        opacity: 1,
                        transition: "fill 0.12s ease",
                      },
                      pressed: {
                        fill: "#e2e8f0",
                        stroke: "#94a3b8",
                        strokeWidth: 0.8,
                        outline: "none",
                        opacity: 1,
                      },
                    }}
                    onMouseEnter={(e) =>
                      handleMove(e as unknown as React.MouseEvent<SVGPathElement>, geoId)
                    }
                    onMouseMove={(e) =>
                      handleMove(e as unknown as React.MouseEvent<SVGPathElement>, geoId)
                    }
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => { if (country) onCountryClick(country); }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: tooltip.x,
            top: tooltip.y - 12,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className="rounded-lg px-3 py-2 shadow-xl whitespace-nowrap"
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            <p className="text-sm font-semibold text-slate-100">{tooltip.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: tooltip.color }}
              />
              <p className="text-xs text-slate-400">{tooltip.status}</p>
            </div>
            {tooltip.hasPage && (
              <p className="mt-1 text-[10px] font-medium text-indigo-400">
                Click for details →
              </p>
            )}
          </div>
          <div
            className="mx-auto h-1.5 w-1.5 rotate-45 -mt-px"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          />
        </div>
      )}

      {/* Scroll-blocked nudge */}
      {scrollHint && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-center">
          <div
            className="rounded-xl px-5 py-3 text-sm font-medium text-slate-300 shadow-2xl"
            style={{
              background: "rgba(15,23,42,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid #334155",
            }}
          >
            Use{" "}
            <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-semibold text-white">+</span>{" "}
            <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-semibold text-white">−</span>{" "}
            to zoom the map
          </div>
        </div>
      )}

      {/* Zoom controls — right edge */}
      <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1">
        {[
          { icon: <Plus className="h-3.5 w-3.5" />, action: zoomIn },
          { icon: <Minus className="h-3.5 w-3.5" />, action: zoomOut },
          { icon: <RotateCcw className="h-3 w-3" />, action: reset },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-700 hover:text-slate-200 active:scale-95"
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Legend — bottom right */}
      <div
        className="absolute bottom-4 right-4 z-20 overflow-hidden rounded-xl"
        style={{
          background: "rgba(15,23,42,0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid #1e293b",
        }}
      >
        <div className="px-3 py-1.5 border-b border-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Visa status
          </p>
        </div>
        <div className="p-2 space-y-0.5">
          {(["visa_free", "visa_on_arrival", "e_visa", "visa_required", "restricted"] as VisaStatus[]).map(
            (status) => {
              const meta   = VISA_STATUS_META[status];
              const active = activeFilter === "all" || activeFilter === status;
              return (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-md px-2 py-1 transition-opacity"
                  style={{ opacity: active ? 1 : 0.25 }}
                >
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    style={{ backgroundColor: meta.mapColor }}
                  />
                  <span className="text-[11px] font-medium text-slate-300">
                    {meta.label}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
