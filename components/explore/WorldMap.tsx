"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Sphere,
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

const UNKNOWN_COLOR = "#0d1f3c";
const HOVER_MAP: Record<string, string> = {
  "#00e676": "#69ffad",
  "#00b0ff": "#62d4ff",
  "#b388ff": "#d0b3ff",
  "#ffab40": "#ffd180",
  "#ff5252": "#ff867f",
  "#1a3150": "#243f63",
  [UNKNOWN_COLOR]: "#1a3050",
};

const DEFAULT_POSITION = { coordinates: [10, 8] as [number, number], zoom: 1 };

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

export function WorldMap({ activeFilter, onCountryClick, selectedCountry }: WorldMapProps) {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [scrollHint, setScrollHint] = useState(false);

  const getFillColor = useCallback(
    (geoId: string) => {
      const c = COUNTRY_BY_NUMERIC[geoId];
      if (!c) return UNKNOWN_COLOR;
      if (activeFilter !== "all" && c.visaStatus !== activeFilter) return "#081525";
      return VISA_STATUS_META[c.visaStatus]?.mapColor ?? UNKNOWN_COLOR;
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
        color: VISA_STATUS_META[c.visaStatus]?.mapColor ?? UNKNOWN_COLOR,
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      });
    },
    []
  );

  // Block scroll/wheel zoom — only allow button-driven zoom + drag panning
  const filterZoomEvent = useCallback((evt: Event) => {
    if (evt.type === "wheel") {
      setScrollHint(true);
      setTimeout(() => setScrollHint(false), 1800);
      return false;
    }
    return true;
  }, []);

  function zoomIn() {
    setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.6, 8) }));
  }
  function zoomOut() {
    setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.6, 0.8) }));
  }
  function resetView() {
    setPosition(DEFAULT_POSITION);
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #000d1f 0%, #001233 50%, #000d1f 100%)",
      }}
    >
      <StarField />

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 155 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(pos) => setPosition({ coordinates: pos.coordinates, zoom: pos.zoom })}
          filterZoomEvent={filterZoomEvent as any}
        >
          <Sphere id="rsm-sphere" fill="#001a3a" stroke="#0a3a6e" strokeWidth={0.5} />
          <Graticule stroke="rgba(30,80,180,0.15)" strokeWidth={0.4} />

          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const geoId = String(parseInt(geo.id, 10));
                const country = COUNTRY_BY_NUMERIC[geoId];
                const fillColor = getFillColor(geoId);
                const isSelected = selectedCountry?.isoNumeric === geoId;
                const isKnown = !!country;
                const isDimmed =
                  activeFilter !== "all" && isKnown && country.visaStatus !== activeFilter;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke={isSelected ? "#ffffff" : "#071428"}
                    strokeWidth={isSelected ? 1.2 : 0.35}
                    style={{
                      default: {
                        fill: isSelected ? "#ffffff" : fillColor,
                        stroke: isSelected ? "#ffffff" : "#071428",
                        strokeWidth: isSelected ? 1.2 : 0.35,
                        outline: "none",
                        cursor: isKnown ? "pointer" : "default",
                        opacity: isDimmed ? 0.12 : 1,
                        transition: "fill 0.2s ease, opacity 0.2s ease",
                        filter: isSelected
                          ? `drop-shadow(0 0 10px ${fillColor})`
                          : isKnown && !isDimmed
                          ? `drop-shadow(0 0 3px ${fillColor}50)`
                          : "none",
                      },
                      hover: {
                        fill: HOVER_MAP[fillColor] ?? fillColor,
                        stroke: isKnown ? "#8ab4f8" : "#071428",
                        strokeWidth: 0.8,
                        outline: "none",
                        cursor: isKnown ? "pointer" : "default",
                        opacity: 1,
                        filter: isKnown ? `drop-shadow(0 0 8px ${fillColor}cc)` : "none",
                        transition: "fill 0.15s ease",
                      },
                      pressed: { fill: "#ffffff", outline: "none", opacity: 1 },
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

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, #000d1f 100%)",
        }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20"
          style={{ left: tooltip.x, top: tooltip.y - 14, transform: "translate(-50%, -100%)" }}
        >
          <div
            className="rounded-xl px-3.5 py-2.5 shadow-2xl border whitespace-nowrap"
            style={{
              background: "rgba(4, 12, 32, 0.94)",
              backdropFilter: "blur(16px)",
              borderColor: `${tooltip.color}40`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${tooltip.color}20`,
            }}
          >
            <p className="text-sm font-bold text-white">{tooltip.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tooltip.color }} />
              <p className="text-xs text-slate-400">{tooltip.status}</p>
            </div>
            {tooltip.hasPage && (
              <p className="mt-1 text-[10px] font-semibold" style={{ color: tooltip.color }}>
                Click for details →
              </p>
            )}
          </div>
          <div
            className="mx-auto h-2 w-2 rotate-45 -mt-px"
            style={{ background: "rgba(4, 12, 32, 0.94)", border: `1px solid ${tooltip.color}30` }}
          />
        </div>
      )}

      {/* Scroll-blocked hint */}
      {scrollHint && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
          <div
            className="rounded-2xl px-5 py-3 text-sm font-semibold text-white text-center shadow-2xl"
            style={{
              background: "rgba(4,12,32,0.9)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(100,150,255,0.2)",
            }}
          >
            Use <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-xs">+</kbd>{" "}
            <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-xs">−</kbd> buttons to zoom
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-5 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5">
        <button
          onClick={zoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(4,12,32,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(100,150,255,0.2)" }}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={zoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{ background: "rgba(4,12,32,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(100,150,255,0.2)" }}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 shadow-lg transition-all hover:scale-110 hover:text-white active:scale-95"
          style={{ background: "rgba(4,12,32,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(100,150,255,0.15)" }}
          title="Reset view"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Legend — bottom right */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-1.5">
        {(["visa_free", "visa_on_arrival", "e_visa", "visa_required", "restricted"] as VisaStatus[]).map(
          (status) => {
            const meta = VISA_STATUS_META[status];
            const isActive = activeFilter === "all" || activeFilter === status;
            return (
              <div
                key={status}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-opacity"
                style={{
                  background: "rgba(4,12,32,0.75)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(100,150,255,0.12)",
                  opacity: isActive ? 1 : 0.3,
                }}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: meta.mapColor,
                    boxShadow: isActive ? `0 0 5px ${meta.mapColor}` : "none",
                  }}
                />
                <span className="text-slate-300">{meta.label}</span>
              </div>
            );
          }
        )}
      </div>

      <StarField />
    </div>
  );
}

function StarField() {
  const stars = [
    { x: 3, y: 5, r: 1 }, { x: 12, y: 15, r: 1.2 }, { x: 22, y: 8, r: 0.8 },
    { x: 35, y: 20, r: 1 }, { x: 48, y: 6, r: 1.4 }, { x: 60, y: 12, r: 0.9 },
    { x: 72, y: 18, r: 1.1 }, { x: 85, y: 7, r: 0.8 }, { x: 93, y: 22, r: 1.2 },
    { x: 8, y: 85, r: 1 }, { x: 18, y: 92, r: 0.9 }, { x: 30, y: 78, r: 1.3 },
    { x: 45, y: 88, r: 0.8 }, { x: 58, y: 82, r: 1 }, { x: 70, y: 90, r: 1.2 },
    { x: 82, y: 75, r: 0.9 }, { x: 92, y: 85, r: 1.1 }, { x: 97, y: 92, r: 0.8 },
    { x: 5, y: 50, r: 0.9 }, { x: 96, y: 48, r: 1.1 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.r * 2, height: s.r * 2,
            opacity: 0.2 + (i % 3) * 0.08,
          }}
        />
      ))}
    </div>
  );
}
