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
import {
  COUNTRY_BY_NUMERIC,
  VISA_STATUS_META,
  type ExploreCountry,
  type VisaStatus,
} from "@/lib/explore-data";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Un-tracked / ocean-fill color
const UNKNOWN_COLOR = "#0d1f3c";

// Hover brightening map
const HOVER_MAP: Record<string, string> = {
  "#00e676": "#69ffad",
  "#00b0ff": "#62d4ff",
  "#b388ff": "#d0b3ff",
  "#ffab40": "#ffd180",
  "#ff5252": "#ff867f",
  "#1a3150": "#243f63",
  [UNKNOWN_COLOR]: "#1a3050",
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
  x: number;
  y: number;
}

export function WorldMap({
  activeFilter,
  onCountryClick,
  selectedCountry,
}: WorldMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const getFillColor = useCallback(
    (geoId: string): string => {
      const country = COUNTRY_BY_NUMERIC[geoId];
      if (!country) return UNKNOWN_COLOR;
      if (activeFilter !== "all" && country.visaStatus !== activeFilter)
        return "#0d1e38"; // dimmed
      return VISA_STATUS_META[country.visaStatus]?.mapColor ?? UNKNOWN_COLOR;
    },
    [activeFilter]
  );

  const handleMove = useCallback(
    (evt: React.MouseEvent<SVGPathElement>, geoId: string) => {
      const country = COUNTRY_BY_NUMERIC[geoId];
      if (!country) { setTooltip(null); return; }
      const svgEl = (evt.currentTarget as Element).closest("svg");
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      setTooltip({
        name: `${country.flag} ${country.name}`,
        status: VISA_STATUS_META[country.visaStatus]?.label ?? "",
        hasPage: country.hasLivePage,
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      });
    },
    []
  );

  return (
    // Full-bleed dark wrapper — no rounded corners, no border
    <div
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(170deg, #000d1f 0%, #001233 45%, #000d1f 100%)",
        minHeight: 580,
      }}
    >
      {/* Subtle star-field dots */}
      <StarField />

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 158, center: [10, 8] }}
        style={{ width: "100%", height: "auto" }}
        height={580}
      >
        <ZoomableGroup center={[10, 8]} minZoom={0.8} maxZoom={7}>
          {/* Ocean fill */}
          <Sphere id="rsm-sphere" fill="#001a3a" stroke="#0a3a6e" strokeWidth={0.6} />

          {/* Latitude / longitude grid */}
          <Graticule stroke="rgba(30,80,180,0.18)" strokeWidth={0.4} />

          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const geoId = String(parseInt(geo.id, 10));
                const country = COUNTRY_BY_NUMERIC[geoId];
                const fillColor = getFillColor(geoId);
                const isSelected =
                  selectedCountry?.isoNumeric === geoId;
                const isKnown = !!country;
                const isDimmed =
                  activeFilter !== "all" &&
                  isKnown &&
                  country.visaStatus !== activeFilter;

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
                        opacity: isDimmed ? 0.18 : 1,
                        transition: "fill 0.2s ease, opacity 0.2s ease",
                        filter: isSelected
                          ? `drop-shadow(0 0 8px ${fillColor})`
                          : isKnown && !isDimmed
                          ? `drop-shadow(0 0 2px ${fillColor}40)`
                          : "none",
                      },
                      hover: {
                        fill: isSelected
                          ? "#f0f4ff"
                          : HOVER_MAP[fillColor] ?? fillColor,
                        stroke: isKnown ? "#8ab4f8" : "#071428",
                        strokeWidth: 0.6,
                        outline: "none",
                        cursor: isKnown ? "pointer" : "default",
                        opacity: 1,
                        filter: isKnown
                          ? `drop-shadow(0 0 6px ${fillColor}aa)`
                          : "none",
                        transition: "fill 0.15s ease",
                      },
                      pressed: {
                        fill: "#ffffff",
                        outline: "none",
                        opacity: 1,
                      },
                    }}
                    onMouseEnter={(e) =>
                      handleMove(
                        e as unknown as React.MouseEvent<SVGPathElement>,
                        geoId
                      )
                    }
                    onMouseMove={(e) =>
                      handleMove(
                        e as unknown as React.MouseEvent<SVGPathElement>,
                        geoId
                      )
                    }
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (country) onCountryClick(country);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Edge vignette — frames the map */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, #000d1f 100%)",
        }}
      />

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
            className="rounded-xl px-3.5 py-2 shadow-2xl border whitespace-nowrap"
            style={{
              background: "rgba(5, 15, 40, 0.92)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(100,150,255,0.25)",
            }}
          >
            <p className="text-sm font-bold text-white">{tooltip.name}</p>
            <p className="text-xs text-slate-400">{tooltip.status}</p>
            {tooltip.hasPage && (
              <p className="mt-0.5 text-[10px] font-semibold text-indigo-400">
                Click to explore →
              </p>
            )}
          </div>
          {/* Arrow */}
          <div className="mx-auto h-2 w-2 rotate-45 bg-slate-900/90 border-b border-r border-indigo-900/50 -mt-px" />
        </div>
      )}

      {/* Bottom legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 px-4">
        {(
          [
            "visa_free",
            "visa_on_arrival",
            "e_visa",
            "visa_required",
            "restricted",
          ] as VisaStatus[]
        ).map((status) => {
          const meta = VISA_STATUS_META[status];
          const isActive = activeFilter === "all" || activeFilter === status;
          return (
            <div
              key={status}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-opacity"
              style={{
                background: "rgba(5,15,40,0.75)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(100,150,255,0.15)",
                opacity: isActive ? 1 : 0.3,
              }}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: meta.mapColor,
                  boxShadow: isActive ? `0 0 6px ${meta.mapColor}` : "none",
                }}
              />
              <span className="text-slate-300">{meta.label}</span>
            </div>
          );
        })}
      </div>

      {/* Zoom hint — top right */}
      <div
        className="absolute right-4 top-4 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-500"
        style={{
          background: "rgba(5,15,40,0.6)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(100,150,255,0.1)",
        }}
      >
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}

// ── Decorative star-field ────────────────────────────────────────────────────
function StarField() {
  // Fixed seed positions so it's deterministic (no hydration mismatch)
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
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.r * 2,
            height: s.r * 2,
            opacity: 0.25 + (i % 3) * 0.1,
          }}
        />
      ))}
    </div>
  );
}
