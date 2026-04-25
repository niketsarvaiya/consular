"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import {
  COUNTRY_BY_NUMERIC,
  VISA_STATUS_META,
  type ExploreCountry,
  type VisaStatus,
} from "@/lib/explore-data";

const TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// CartoDB DarkMatter — the professional dark tile layer used across the industry
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface WorldMapProps {
  activeFilter: VisaStatus | "all";
  onCountryClick: (c: ExploreCountry) => void;
  selectedCountry: ExploreCountry | null;
}

export function WorldMap({
  activeFilter,
  onCountryClick,
  selectedCountry,
}: WorldMapProps) {
  const [countries, setCountries] = useState<FeatureCollection | null>(null);

  // Fetch + convert topojson → geojson once
  useEffect(() => {
    fetch(TOPO_URL)
      .then((r) => r.json())
      .then(async (topo) => {
        const { feature } = await import("topojson-client");
        setCountries(
          feature(topo, topo.objects.countries) as unknown as FeatureCollection
        );
      });
  }, []);

  // Style each country feature
  const getStyle = useCallback(
    (feature: any): PathOptions => {
      const id = String(parseInt(feature.id, 10));
      const c = COUNTRY_BY_NUMERIC[id];
      const isSelected = selectedCountry?.isoNumeric === id;

      // Non-live countries: invisible overlay (Carto tiles show through naturally)
      if (!c?.hasLivePage) {
        return { fillOpacity: 0, weight: 0 };
      }

      // Filtered out
      if (activeFilter !== "all" && c.visaStatus !== activeFilter) {
        return { fillOpacity: 0, weight: 0 };
      }

      const color = VISA_STATUS_META[c.visaStatus].mapColor;
      return {
        fillColor: color,
        fillOpacity: isSelected ? 0.85 : 0.55,
        weight: isSelected ? 2 : 1,
        color: color,
        opacity: isSelected ? 1 : 0.7,
      };
    },
    [activeFilter, selectedCountry]
  );

  // Bind tooltip + click handler to each feature
  const onEachFeature = useCallback(
    (feature: any, layer: Layer) => {
      const id = String(parseInt(feature.id, 10));
      const c = COUNTRY_BY_NUMERIC[id];
      if (!c?.hasLivePage) return;

      const meta = VISA_STATUS_META[c.visaStatus];
      const hasFilter =
        activeFilter === "all" || c.visaStatus === activeFilter;
      if (!hasFilter) return;

      layer.bindTooltip(
        `<div style="
          background:#1e293b;
          border:1px solid #334155;
          border-radius:8px;
          padding:6px 10px;
          box-shadow:0 4px 16px rgba(0,0,0,0.5);
          pointer-events:none;
        ">
          <div style="font-weight:700;color:#f1f5f9;font-size:13px">${c.flag} ${c.name}</div>
          <div style="display:flex;align-items:center;gap:5px;margin-top:3px">
            <span style="width:7px;height:7px;border-radius:50%;background:${meta.mapColor};display:inline-block;flex-shrink:0"></span>
            <span style="color:#94a3b8;font-size:11px">${meta.label}</span>
          </div>
          ${c.totalFeeINR !== undefined ? `<div style="color:#64748b;font-size:10px;margin-top:2px">from ₹${c.totalFeeINR === 0 ? "Free" : c.totalFeeINR.toLocaleString("en-IN")}</div>` : ""}
          <div style="color:${meta.mapColor};font-size:10px;margin-top:3px;font-weight:600">Click for details →</div>
        </div>`,
        {
          sticky: true,
          opacity: 1,
          className: "consular-tooltip",
          offset: [12, 0],
        }
      );

      (layer as any).on({
        click: () => onCountryClick(c),
        mouseover: (e: any) => {
          e.target.setStyle({ fillOpacity: 0.8 });
          e.target.bringToFront();
        },
        mouseout: (e: any) => {
          e.target.setStyle({ fillOpacity: 0.55 });
        },
      });
    },
    [activeFilter, onCountryClick]
  );

  return (
    <div className="absolute inset-0">
      {/* Leaflet CSS overrides — keeps the attribution small and hides default tooltips */}
      <style>{`
        .leaflet-container { background: #0a1628 !important; }
        .leaflet-control-attribution {
          background: rgba(15,23,42,0.8) !important;
          color: #475569 !important;
          font-size: 10px !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-attribution a { color: #64748b !important; }
        .leaflet-control-zoom {
          border: none !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        }
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
          background: #1e293b !important;
          color: #94a3b8 !important;
          border: none !important;
          border-bottom: 1px solid #0f172a !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
          font-weight: 300 !important;
          transition: background 0.15s !important;
        }
        .leaflet-control-zoom-in:hover,
        .leaflet-control-zoom-out:hover {
          background: #334155 !important;
          color: #e2e8f0 !important;
        }
        .consular-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .consular-tooltip::before { display: none !important; }
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; }
      `}</style>

      <MapContainer
        center={[20, 15]}
        zoom={2}
        minZoom={2}
        maxZoom={8}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#0a1628" }}
      >
        {/* CartoDB DarkMatter — professional dark basemap with labels + terrain */}
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTR}
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Visa status overlay — colored transparent fills for 52 live destinations */}
        {countries && (
          <GeoJSON
            key={`${activeFilter}-${selectedCountry?.iso2 ?? "none"}`}
            data={countries}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Zoom control — bottom right */}
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
