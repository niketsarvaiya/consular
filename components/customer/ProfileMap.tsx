"use client";

import { useState, useMemo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { Plus, Minus } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const BG = "#0b1220";
const BASE = "#1e293b";
const BASE_HOVER = "#334155";
const VISITED = "#34d399";
const VISITED_HOVER = "#6ee7b7";
const PLANNED = "#FF6B4A";

export interface PlannedTrip {
  geoId: string;     // ISO numeric (matches world-atlas geo.id)
  name: string;
  flag?: string | null;
  status: string;    // application status label
}

interface ProfileMapProps {
  visited: Set<string>;           // ISO numeric codes (controlled by parent)
  onToggle: (geoId: string) => void;
  planned: PlannedTrip[];
  editable?: boolean;
  savingId?: string | null;
}

interface Tooltip {
  name: string;
  sub: string;
  x: number;
  y: number;
}

// Normalise world-atlas geo.id (may be zero-padded string) to plain numeric string
function norm(id: string | number): string {
  return String(parseInt(String(id), 10));
}

export function ProfileMap({ visited, onToggle, planned, editable = true, savingId = null }: ProfileMapProps) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [0, 0],
    zoom: 1,
  });
  const saving = savingId;

  // Distinguish a click (toggle visited) from a drag (pan). Record pointer-down
  // position; if the pointer moved more than a few px, treat it as a pan and
  // skip the toggle — exactly how Google Maps ignores a click after a drag.
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);

  const plannedSet = useMemo(() => new Set(planned.map((p) => norm(p.geoId))), [planned]);
  const plannedByGeo = useMemo(() => {
    const m: Record<string, PlannedTrip> = {};
    for (const p of planned) m[norm(p.geoId)] = p;
    return m;
  }, [planned]);

  const toggleVisited = (geoId: string) => {
    if (!editable) return;
    if (draggedRef.current) return; // was a pan, not a click
    onToggle(norm(geoId));
  };

  const clampZoom = (z: number) => Math.min(Math.max(z, 1), 8);

  return (
    <div
      className="absolute inset-0 cursor-grab overflow-hidden active:cursor-grabbing"
      style={{ background: BG }}
      onMouseDown={(e) => {
        downPos.current = { x: e.clientX, y: e.clientY };
        draggedRef.current = false;
      }}
      onMouseMove={(e) => {
        if (!downPos.current) return;
        const dx = e.clientX - downPos.current.x;
        const dy = e.clientY - downPos.current.y;
        if (Math.hypot(dx, dy) > 5) draggedRef.current = true;
      }}
      onMouseUp={() => { downPos.current = null; }}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 165 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          minZoom={1}
          maxZoom={8}
          onMoveEnd={(pos) => setPosition(pos)}
          // Allow drag-to-pan & pinch, but ignore wheel so page scrolling still works.
          // (rsm's types mis-declare this param; the runtime value is the d3 zoom event)
          filterZoomEvent={(d3Event) => (d3Event as unknown as { type: string }).type !== "wheel"}
        >
        <Graticule stroke="rgba(148,163,184,0.05)" strokeWidth={0.4} />

        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) => {
            const plannedGeos = geographies.filter((g) => plannedSet.has(norm(g.id)));
            return (
              <>
                {geographies.map((geo: any) => {
                  const id = norm(geo.id);
                  const isVisited = visited.has(id);
                  const isPlanned = plannedSet.has(id);
                  const name = geo.properties?.name ?? "";
                  const fill = isVisited ? VISITED : isPlanned ? "rgba(255,107,74,0.35)" : BASE;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget as Element).closest("svg")!.getBoundingClientRect();
                        setTooltip({
                          name,
                          sub: isVisited ? "Visited ✓" : isPlanned ? "Trip planned ✈" : editable ? "Click to mark visited" : "",
                          x: (e as React.MouseEvent).clientX - rect.left,
                          y: (e as React.MouseEvent).clientY - rect.top,
                        });
                      }}
                      onMouseMove={(e) => {
                        const rect = (e.currentTarget as Element).closest("svg")!.getBoundingClientRect();
                        setTooltip((t) => (t ? { ...t, x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top } : t));
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => toggleVisited(id)}
                      style={{
                        default: {
                          fill,
                          stroke: BG,
                          strokeWidth: 0.3,
                          outline: "none",
                          cursor: editable ? "pointer" : "default",
                          transition: "fill 0.18s ease",
                          opacity: saving === id ? 0.6 : 1,
                        },
                        hover: {
                          fill: isVisited ? VISITED_HOVER : isPlanned ? "rgba(255,107,74,0.55)" : BASE_HOVER,
                          stroke: BG,
                          strokeWidth: 0.3,
                          outline: "none",
                          cursor: editable ? "pointer" : "default",
                        },
                        pressed: { fill: VISITED, stroke: BG, strokeWidth: 0.3, outline: "none" },
                      }}
                    />
                  );
                })}

                {/* ── Cute planned-trip markers ── */}
                {plannedGeos.map((geo: any) => {
                  const [lng, lat] = geoCentroid(geo);
                  const trip = plannedByGeo[norm(geo.id)];
                  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
                  return (
                    <Marker key={`m-${geo.rsmKey}`} coordinates={[lng, lat]}>
                      {/* pulse ring */}
                      <circle r={8} fill="rgba(255,107,74,0.25)">
                        <animate attributeName="r" values="6;13;6" dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                      {/* pin */}
                      <g transform="translate(0,0)">
                        <circle r={5} fill={PLANNED} stroke="#fff" strokeWidth={1.2} />
                        <text textAnchor="middle" dy={2.3} fontSize={5} fill="#fff">✈</text>
                      </g>
                      {/* flag label above */}
                      {trip?.flag && (
                        <text textAnchor="middle" y={-10} fontSize={9}>
                          {trip.flag}
                        </text>
                      )}
                    </Marker>
                  );
                })}
              </>
            );
          }}
        </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && tooltip.name && (
        <div
          className="pointer-events-none absolute z-20"
          style={{ left: tooltip.x, top: tooltip.y - 12, transform: "translate(-50%, -100%)" }}
        >
          <div className="rounded-lg bg-slate-800 px-3 py-1.5 shadow-xl ring-1 ring-slate-700">
            <p className="text-xs font-semibold text-slate-100 whitespace-nowrap">{tooltip.name}</p>
            {tooltip.sub && <p className="text-[10px] text-slate-400 whitespace-nowrap">{tooltip.sub}</p>}
          </div>
          <div className="mx-auto -mt-px h-1.5 w-1.5 rotate-45 bg-slate-800" />
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
        {[
          { icon: <Plus className="h-3.5 w-3.5" />, fn: () => setPosition((p) => ({ ...p, zoom: clampZoom(p.zoom * 1.4) })) },
          { icon: <Minus className="h-3.5 w-3.5" />, fn: () => setPosition((p) => ({ ...p, zoom: clampZoom(p.zoom / 1.4) })) },
        ].map((b, i) => (
          <button
            key={i}
            type="button"
            onClick={b.fn}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/90 text-slate-300 ring-1 ring-slate-700 backdrop-blur transition hover:bg-slate-700 active:scale-95"
          >
            {b.icon}
          </button>
        ))}
      </div>

    </div>
  );
}
