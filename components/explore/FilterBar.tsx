"use client";

import { motion } from "framer-motion";
import { type VisaStatus, VISA_STATUS_META } from "@/lib/explore-data";

type Filter = VisaStatus | "all";

const FILTERS: { key: Filter; label: string; icon?: string }[] = [
  { key: "all", label: "All countries" },
  { key: "visa_free", label: "Visa Free" },
  { key: "visa_on_arrival", label: "On Arrival" },
  { key: "e_visa", label: "e-Visa" },
  { key: "visa_required", label: "Visa Required" },
];

interface FilterBarProps {
  active: Filter;
  onChange: (f: Filter) => void;
  counts: Partial<Record<Filter, number>>;
}

export function FilterBar({ active, onChange, counts }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key;
        const count = counts[key];
        const meta = key !== "all" ? VISA_STATUS_META[key as VisaStatus] : null;

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
            }`}
          >
            {meta && (
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isActive ? "white" : meta.mapColor,
                  opacity: isActive ? 0.8 : 1,
                }}
              />
            )}
            {label}
            {count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="filter-highlight"
                className="absolute inset-0 rounded-full bg-indigo-600 -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
