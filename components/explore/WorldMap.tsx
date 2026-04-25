"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { useState, useCallback } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import {
  COUNTRY_BY_NUMERIC,
  VISA_STATUS_META,
  type ExploreCountry,
  type VisaStatus,
} from "@/lib/explore-data";

// 50m = smooth, realistic borders
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const BASE_COUNTRY = "#1e3a5f";
const BG_COLOR = "#0a1628";

const HOVER: Record<string, string> = {
  "#34d399": "#6ee7b7",
  "#60a5fa": "#93c5fd",
  "#a78bfa": "#c4b5fd",
  "#fbbf24": "#fde68a",
  "#f87171": "#fca5a5",
  "#1e3a5f": "#2d5080",
};

const DEFAULT_POSITION = {
  coordinates: [10, 8] as [number, number],
  zoom: 1,
};

// ── Country label positions [lng, lat] ───────────────────────────────────────
// Live Consular destinations + major world countries for geographic context
const LABELS: {
  iso2: string;
  name: string;
  coords: [number, number];
  minZoom: number; // show only when zoomed to this level or above
}[] = [
  // ── Continent-scale orientation only at zoom ≥ 1.8 ──────────────────────────
  { iso2: "RU", name: "Russia",        coords: [90,   61],   minZoom: 1.8 },
  { iso2: "CN", name: "China",         coords: [104,  35],   minZoom: 1.8 },
  { iso2: "US", name: "USA",           coords: [-98,  38],   minZoom: 1.8 },
  { iso2: "CA", name: "Canada",        coords: [-96,  56],   minZoom: 1.8 },
  { iso2: "BR", name: "Brazil",        coords: [-52,  -10],  minZoom: 1.8 },
  { iso2: "AU", name: "Australia",     coords: [133,  -25],  minZoom: 1.8 },
  { iso2: "IN", name: "India",         coords: [80,   22],   minZoom: 1.8 },
  // ── Large live destinations at zoom ≥ 2.2 ───────────────────────────────────
  { iso2: "TH", name: "Thailand",      coords: [100,  15],   minZoom: 2.2 },
  { iso2: "JP", name: "Japan",         coords: [138,  37],   minZoom: 2.2 },
  { iso2: "GB", name: "UK",            coords: [-2,   52],   minZoom: 2.2 },
  { iso2: "DE", name: "Germany",       coords: [10,   51],   minZoom: 2.2 },
  { iso2: "FR", name: "France",        coords: [2,    46],   minZoom: 2.2 },
  { iso2: "IT", name: "Italy",         coords: [12,   42],   minZoom: 2.2 },
  { iso2: "ES", name: "Spain",         coords: [-4,   40],   minZoom: 2.2 },
  { iso2: "TR", name: "Turkey",        coords: [35,   39],   minZoom: 2.2 },
  { iso2: "EG", name: "Egypt",         coords: [30,   27],   minZoom: 2.2 },
  { iso2: "KE", name: "Kenya",         coords: [38,    0],   minZoom: 2.2 },
  { iso2: "ID", name: "Indonesia",     coords: [118,  -2],   minZoom: 2.2 },
  { iso2: "MY", name: "Malaysia",      coords: [110,   4],   minZoom: 2.2 },
  { iso2: "AE", name: "UAE",           coords: [54,   24],   minZoom: 2.2 },
  { iso2: "NZ", name: "New Zealand",   coords: [172, -42],   minZoom: 2.2 },
  // ── Medium destinations at zoom ≥ 2.8 ───────────────────────────────────────
  { iso2: "VN", name: "Vietnam",       coords: [106,  16],   minZoom: 2.8 },
  { iso2: "KR", name: "South Korea",   coords: [127,  37],   minZoom: 2.8 },
  { iso2: "PT", name: "Portugal",      coords: [-8,   39],   minZoom: 2.8 },
  { iso2: "GR", name: "Greece",        coords: [22,   39],   minZoom: 2.8 },
  { iso2: "PL", name: "Poland",        coords: [20,   52],   minZoom: 2.8 },
  { iso2: "SE", name: "Sweden",        coords: [17,   62],   minZoom: 2.8 },
  { iso2: "NO", name: "Norway",        coords: [10,   65],   minZoom: 2.8 },
  { iso2: "OM", name: "Oman",          coords: [57,   22],   minZoom: 2.8 },
  { iso2: "TZ", name: "Tanzania",      coords: [35,   -6],   minZoom: 2.8 },
  { iso2: "PH", name: "Philippines",   coords: [122,  13],   minZoom: 2.8 },
  { iso2: "LK", name: "Sri Lanka",     coords: [81,    8],   minZoom: 2.8 },
  { iso2: "KH", name: "Cambodia",      coords: [105,  12],   minZoom: 2.8 },
  // ── Small destinations at zoom ≥ 3.5 ────────────────────────────────────────
  { iso2: "SG", name: "Singapore",     coords: [104,   1],   minZoom: 3.5 },
  { iso2: "NL", name: "Netherlands",   coords: [5,    52],   minZoom: 3.5 },
  { iso2: "AT", name: "Austria",       coords: [14,   47],   minZoom: 3.5 },
  { iso2: "CH", name: "Switzerland",   coords: [8,    47],   minZoom: 3.5 },
  { iso2: "CZ", name: "Czechia",       coords: [15,   50],   minZoom: 3.5 },
  { iso2: "HU", name: "Hungary",       coords: [19,   47],   minZoom: 3.5 },
  { iso2: "HR", name: "Croatia",       coords: [15,   45],   minZoom: 3.5 },
  { iso2: "GE", name: "Georgia",       coords: [43,   42],   minZoom: 3.5 },
  { iso2: "AZ", name: "Azerbaijan",    coords: [47,   40],   minZoom: 3.5 },
  { iso2: "QA", name: "Qatar",         coords: [51,   25],   minZoom: 3.5 },
  { iso2: "MV", name: "Maldives",      coords: [73,    4],   minZoom: 3.5 },
  { iso2: "MU", name: "Mauritius",     coords: [57,  -20],   minZoom: 3.5 },
  { iso2: "RS", name: "Serbia",        coords: [21,   44],   minZoom: 3.5 },
];

interface WorldMapProps {
  activeFilter: VisaStatus | "all";
  onCountryClick: (c: ExploreCountry) => void;
  selectedCountry: ExploreCountry | null;
}

interface TooltipState {
  name: string;
  status: string;
  color: string;
  hasPage: boolean;
  x: number;
  y: number;
}

export function WorldMap({ activeFilter, onCountryClick, selectedCountry }: WorldMapProps) {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [scrollHint, setScrollHint] = useState(false);

  const getFill = useCallback(
    (geoId: string): string => {
      const c = COUNTRY_BY_NUMERIC[geoId];
      if (!c?.hasLivePage) return BASE_COUNTRY;
      if (activeFilter !== "all" && c.visaStatus !== activeFilter) return BASE_COUNTRY;
      return VISA_STATUS_META[c.visaStatus]?.mapColor ?? BASE_COUNTRY;
    },
    [activeFilter]
  );

  const handleMove = useCallback(
    (evt: React.MouseEvent<SVGPathElement>, geoId: string) => {
      const c = COUNTRY_BY_NUMERIC[geoId];
      if (!c?.hasLivePage) { setTooltip(null); return; }
      if (activeFilter !== "all" && c.visaStatus !== activeFilter) { setTooltip(null); return; }
      const svgEl = (evt.currentTarget as Element).closest("svg");
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      setTooltip({
        name: `${c.flag} ${c.name}`,
        status: VISA_STATUS_META[c.visaStatus]?.label ?? "",
        color: VISA_STATUS_META[c.visaStatus]?.mapColor ?? BASE_COUNTRY,
        hasPage: c.hasLivePage,
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      });
    },
    [activeFilter]
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

  // Labels sit inside ZoomableGroup which applies scale(zoom) to its <g>.
  // Divide by zoom so the rendered visual size stays constant regardless of zoom.
  const labelSize = 5.5 / position.zoom;

  return (
    <div className="absolute inset-0 overflow-hidden select-none" style={{ background: BG_COLOR }}>
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
          <Graticule stroke="rgba(148,163,184,0.05)" strokeWidth={0.4} />

          {/* ── Country fills ── */}
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const geoId    = String(parseInt(geo.id, 10));
                const country  = COUNTRY_BY_NUMERIC[geoId];
                const fill     = getFill(geoId);
                const isSelected = selectedCountry?.isoNumeric === geoId;
                const isLive   = !!country?.hasLivePage;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: isSelected ? "#f1f5f9" : fill,
                        stroke: "#0a1628",
                        strokeWidth: 0.2,
                        outline: "none",
                        cursor: isLive ? "pointer" : "default",
                        transition: "fill 0.18s ease",
                      },
                      hover: {
                        fill: isSelected ? "#ffffff" : (HOVER[fill] ?? "#2d5080"),
                        stroke: "#0a1628",
                        strokeWidth: 0.2,
                        outline: "none",
                        cursor: isLive ? "pointer" : "default",
                      },
                      pressed: { fill: "#e2e8f0", stroke: "#0a1628", strokeWidth: 0.2, outline: "none" },
                    }}
                    onMouseEnter={(e) => handleMove(e as unknown as React.MouseEvent<SVGPathElement>, geoId)}
                    onMouseMove={(e) => handleMove(e as unknown as React.MouseEvent<SVGPathElement>, geoId)}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => { if (country && isLive) onCountryClick(country); }}
                  />
                );
              })
            }
          </Geographies>

          {/* ── Country name labels ── */}
          {LABELS.filter((l) => position.zoom >= (l.minZoom ?? 1)).map((label) => {
            const c = COUNTRY_BY_NUMERIC[
              // look up by iso2 → find numeric
              Object.keys(COUNTRY_BY_NUMERIC).find(
                (k) => COUNTRY_BY_NUMERIC[k].iso2 === label.iso2
              ) ?? ""
            ];
            const isLive = c?.hasLivePage ?? false;
            const isActive =
              !isLive ||
              activeFilter === "all" ||
              (c && c.visaStatus === activeFilter);
            const fillColor = isLive
              ? VISA_STATUS_META[c!.visaStatus]?.mapColor ?? BASE_COUNTRY
              : "#94a3b8";

            return (
              <Marker key={label.iso2} coordinates={label.coords}>
                <text
                  textAnchor="middle"
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: labelSize,
                    fontWeight: 500,
                    fill: isLive ? fillColor : "rgba(148,163,184,0.45)",
                    opacity: isActive ? 1 : 0.2,
                    pointerEvents: "none",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {label.name}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20"
          style={{ left: tooltip.x, top: tooltip.y - 12, transform: "translate(-50%, -100%)" }}
        >
          <div
            className="rounded-lg px-3 py-2 shadow-xl whitespace-nowrap"
            style={{ background: "#1e293b", border: "1px solid #334155", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
          >
            <p className="text-sm font-semibold text-slate-100">{tooltip.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tooltip.color }} />
              <p className="text-xs text-slate-400">{tooltip.status}</p>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-indigo-400">Click for details →</p>
          </div>
          <div className="mx-auto h-1.5 w-1.5 rotate-45 -mt-px" style={{ background: "#1e293b", border: "1px solid #334155" }} />
        </div>
      )}

      {/* Scroll nudge */}
      {scrollHint && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-center">
          <div className="rounded-xl px-5 py-3 text-sm font-medium text-slate-300 shadow-2xl"
            style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)", border: "1px solid #334155" }}>
            Use <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-semibold text-white">+</span>{" "}
            <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-semibold text-white">−</span> to zoom the map
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1">
        {[
          { icon: <Plus className="h-3.5 w-3.5" />, action: zoomIn },
          { icon: <Minus className="h-3.5 w-3.5" />, action: zoomOut },
          { icon: <RotateCcw className="h-3 w-3" />, action: reset },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-700 hover:text-slate-200 active:scale-95"
            style={{ background: "#1e293b", border: "1px solid #334155" }}>
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-20 overflow-hidden rounded-xl"
        style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)", border: "1px solid #1e293b" }}>
        <div className="px-3 py-1.5 border-b border-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Visa status</p>
        </div>
        <div className="p-2 space-y-0.5">
          {(["visa_free", "visa_on_arrival", "e_visa", "visa_required", "restricted"] as VisaStatus[]).map((status) => {
            const meta = VISA_STATUS_META[status];
            const active = activeFilter === "all" || activeFilter === status;
            return (
              <div key={status} className="flex items-center gap-2 rounded-md px-2 py-1 transition-opacity" style={{ opacity: active ? 1 : 0.25 }}>
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ backgroundColor: meta.mapColor }} />
                <span className="text-[11px] font-medium text-slate-300">{meta.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
