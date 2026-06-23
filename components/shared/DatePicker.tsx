"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, X } from "lucide-react";
import "react-day-picker/style.css";

interface DatePickerProps {
  /** Value in yyyy-MM-dd format (or "") */
  value: string;
  /** Called with yyyy-MM-dd string (or "" when cleared) */
  onChange: (value: string) => void;
  placeholder?: string;
  /** Earliest selectable date (yyyy-MM-dd) */
  min?: string;
  /** Latest selectable date (yyyy-MM-dd) */
  max?: string;
  /** Show month + year dropdowns for fast navigation (great for DOB) */
  withDropdowns?: boolean;
  /** Earliest year to show in the year dropdown */
  fromYear?: number;
  /** Latest year to show in the year dropdown */
  toYear?: number;
  required?: boolean;
  className?: string;
  id?: string;
}

function parseISO(v: string): Date | undefined {
  if (!v) return undefined;
  const d = parse(v, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select a date",
  min,
  max,
  withDropdowns = false,
  fromYear,
  toYear,
  required,
  className = "",
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = parseISO(value);
  const minDate = parseISO(min ?? "");
  const maxDate = parseISO(max ?? "");

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentYear = new Date().getFullYear();
  const startMonth = new Date(fromYear ?? currentYear - 100, 0);
  const endMonth = new Date(toYear ?? currentYear + 10, 11);

  const disabled = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm transition-colors ${
          open ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? format(selected, "dd MMM yyyy") : placeholder}
        </span>
        <span className="flex items-center gap-1.5">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </span>
      </button>

      {/* Hidden input keeps native required validation working */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value}
          onChange={() => {}}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="visasetgo-datepicker absolute left-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10"
          >
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected ?? maxDate ?? new Date()}
              onSelect={(d) => {
                if (d) {
                  onChange(format(d, "yyyy-MM-dd"));
                  setOpen(false);
                }
              }}
              captionLayout={withDropdowns ? "dropdown" : "label"}
              startMonth={startMonth}
              endMonth={endMonth}
              disabled={disabled.length ? disabled : undefined}
              showOutsideDays
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme overrides for react-day-picker (scoped) */}
      <style jsx global>{`
        .visasetgo-datepicker {
          --rdp-accent-color: #4f46e5;
          --rdp-accent-background-color: #eef2ff;
          --rdp-day-width: 38px;
          --rdp-day-height: 38px;
          --rdp-day_button-width: 38px;
          --rdp-day_button-height: 38px;
          --rdp-day_button-border-radius: 10px;
          --rdp-selected-border: none;
          --rdp-today-color: #4f46e5;
          --rdp-outside-opacity: 0.4;
          --rdp-disabled-opacity: 0.25;
          --rdp-font-family: inherit;
        }
        .visasetgo-datepicker .rdp-root {
          margin: 0;
          font-size: 0.875rem;
        }
        .visasetgo-datepicker .rdp-month_caption {
          font-weight: 600;
          color: #0f172a;
          font-size: 0.875rem;
          padding-left: 0.25rem;
        }
        .visasetgo-datepicker .rdp-weekday {
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.7rem;
          text-transform: uppercase;
        }
        .visasetgo-datepicker .rdp-day_button {
          font-weight: 500;
          color: #334155;
          transition: background-color 0.12s, color 0.12s;
        }
        .visasetgo-datepicker .rdp-day_button:hover:not([disabled]) {
          background-color: #eef2ff;
          color: #4f46e5;
        }
        .visasetgo-datepicker .rdp-selected .rdp-day_button {
          background-color: var(--rdp-accent-color);
          color: #fff;
          font-weight: 600;
        }
        .visasetgo-datepicker .rdp-selected .rdp-day_button:hover {
          background-color: #4338ca;
          color: #fff;
        }
        .visasetgo-datepicker .rdp-today:not(.rdp-selected) .rdp-day_button {
          color: var(--rdp-today-color);
          font-weight: 700;
        }
        .visasetgo-datepicker .rdp-chevron {
          fill: #64748b;
        }
        .visasetgo-datepicker .rdp-button_previous:hover .rdp-chevron,
        .visasetgo-datepicker .rdp-button_next:hover .rdp-chevron {
          fill: #4f46e5;
        }
        .visasetgo-datepicker .rdp-dropdowns {
          gap: 0.5rem;
        }
        .visasetgo-datepicker .rdp-dropdown_root {
          position: relative;
        }
        .visasetgo-datepicker select.rdp-dropdown {
          font-weight: 600;
          color: #0f172a;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
        }
        .visasetgo-datepicker select.rdp-dropdown:focus {
          outline: none;
          border-color: #818cf8;
        }
      `}</style>
    </div>
  );
}
