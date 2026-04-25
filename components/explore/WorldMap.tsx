"use client";

import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  COUNTRY_BY_NUMERIC,
  VISA_STATUS_META,
  type ExploreCountry,
  type VisaStatus,
} from "@/lib/explore-data";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Colors for countries not in our dataset
const DEFAULT_COLOR = "#1e293b"; // slate-800

interface WorldMapProps {
  activeFilter: VisaStatus | "all";
  onCountryClick: (country: ExploreCountry) => void;
  selectedCountry: ExploreCountry | null;
}

export function WorldMap({ activeFilter, onCountryClick, selectedCountry }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<{
    name: string;
    status: string;
    x: number;
    y: number;
  } | null>(null);

  const getFillColor = useCallback(
    (geoId: string): string => {
      const country = COUNTRY_BY_NUMERIC[geoId];
      if (!country) return DEFAULT_COLOR;

      // Dim countries that don't match the active filter
      if (activeFilter !== "all" && country.visaStatus !== activeFilter) {
        return "#1e293b"; // dim
      }

      return VISA_STATUS_META[country.visaStatus]?.mapColor ?? DEFAULT_COLOR;
    },
    [activeFilter]
  );

  const handleMouseEnter = useCallback(
    (evt: React.MouseEvent, geoId: string) => {
      const country = COUNTRY_BY_NUMERIC[geoId];
      if (!country) return;
      const rect = (evt.currentTarget as HTMLElement)
        .closest("svg")
        ?.getBoundingClientRect();
      if (!rect) return;
      setTooltipContent({
        name: `${country.flag} ${country.name}`,
        status: VISA_STATUS_META[country.visaStatus]?.label ?? "",
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipContent(null);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
      {/* Map */}
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        style={{ width: "100%", height: "auto" }}
        height={500}
      >
        <ZoomableGroup center={[10, 15]} minZoom={0.8} maxZoom={6}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoId = String(parseInt(geo.id, 10)); // strip leading zeros: "036" → "36"
                const country = COUNTRY_BY_NUMERIC[geoId];
                const isSelected = selectedCountry?.isoNumeric === geoId;
                const fillColor = getFillColor(geoId);
                const isClickable = !!country;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#0f172a"
                    strokeWidth={0.4}
                    style={{
                      default: {
                        fill: isSelected ? "#f8fafc" : fillColor,
                        stroke: isSelected ? "#f8fafc" : "#0f172a",
                        strokeWidth: isSelected ? 1 : 0.4,
                        outline: "none",
                        cursor: isClickable ? "pointer" : "default",
                        filter: isSelected
                          ? "drop-shadow(0 0 6px rgba(248,250,252,0.8))"
                          : "none",
                        transition: "fill 0.15s ease",
                      },
                      hover: {
                        fill: country
                          ? isSelected
                            ? "#f8fafc"
                            : lighten(fillColor)
                          : "#334155",
                        stroke: country ? "#94a3b8" : "#1e293b",
                        strokeWidth: 0.6,
                        outline: "none",
                        cursor: isClickable ? "pointer" : "default",
                      },
                      pressed: {
                        fill: "#e2e8f0",
                        outline: "none",
                      },
                    }}
                    onMouseEnter={(evt) => handleMouseEnter(evt as unknown as React.MouseEvent, geoId)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={(evt) => handleMouseEnter(evt as unknown as React.MouseEvent, geoId)}
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

      {/* SVG Tooltip */}
      {tooltipContent && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
          style={{ left: tooltipContent.x, top: tooltipContent.y - 8 }}
        >
          <div className="rounded-lg bg-slate-900/95 backdrop-blur px-3 py-1.5 shadow-xl border border-slate-700 whitespace-nowrap">
            <p className="text-sm font-semibold text-white">{tooltipContent.name}</p>
            <p className="text-xs text-slate-400">{tooltipContent.status}</p>
          </div>
          <div className="mx-auto h-1.5 w-1.5 rotate-45 bg-slate-900 border-b border-r border-slate-700 -mt-px" />
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
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
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity ${
                isActive ? "opacity-100" : "opacity-30"
              }`}
              style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: meta.mapColor }}
              />
              <span className="text-slate-300">{meta.label}</span>
            </div>
          );
        })}
      </div>

      {/* Zoom hint */}
      <div className="absolute top-3 right-3 rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-[11px] text-slate-500 border border-slate-800">
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}

// Utility: lighten a hex color slightly for hover effect
function lighten(hex: string): string {
  const colorMap: Record<string, string> = {
    "#10b981": "#34d399", // emerald
    "#3b82f6": "#60a5fa", // blue
    "#8b5cf6": "#a78bfa", // violet
    "#f59e0b": "#fbbf24", // amber
    "#ef4444": "#f87171", // red
    "#94a3b8": "#cbd5e1", // slate
    "#1e293b": "#334155", // dark slate
  };
  return colorMap[hex] ?? hex;
}
