"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Clock, DollarSign, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import { type ExploreCountry, VISA_STATUS_META } from "@/lib/explore-data";
import { TravelSearch } from "./TravelSearch";

interface CountryDrawerProps {
  country: ExploreCountry | null;
  onClose: () => void;
}

export function CountryDrawer({ country, onClose }: CountryDrawerProps) {
  return (
    <AnimatePresence>
      {country && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 35 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            {/* Hero image */}
            {country.heroImage ? (
              <div className="relative h-44 w-full overflow-hidden flex-shrink-0">
                <img
                  src={country.heroImage}
                  alt={country.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <p className="text-2xl font-black text-white leading-none">
                    {country.flag} {country.name}
                  </p>
                  {country.tagline && (
                    <p className="mt-1 text-sm text-white/80">{country.tagline}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 flex-shrink-0">
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {country.flag} {country.name}
                  </p>
                  {country.tagline && (
                    <p className="text-sm text-slate-500">{country.tagline}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Visa status badge */}
              {(() => {
                const meta = VISA_STATUS_META[country.visaStatus];
                return (
                  <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${meta.badge}`}>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: meta.mapColor }}
                    />
                    {meta.label}
                  </div>
                );
              })()}

              {/* Quick stats */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {country.processingDays && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-medium">Processing</span>
                    </div>
                    <p className="mt-1.5 text-base font-bold text-slate-900">
                      {country.processingDays}
                    </p>
                  </div>
                )}
                {country.totalFeeINR !== undefined && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-medium">From</span>
                    </div>
                    <p className="mt-1.5 text-base font-bold text-slate-900">
                      {country.totalFeeINR === 0
                        ? "Free"
                        : `₹${country.totalFeeINR.toLocaleString("en-IN")}`}
                    </p>
                  </div>
                )}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-medium">Region</span>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-slate-900">
                    {country.region}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs font-medium">Passport</span>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-slate-900">
                    Indian 🇮🇳
                  </p>
                </div>
              </div>

              {/* What you'll need */}
              <div className="mt-5 rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Typical documents
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Valid passport (6+ months validity)",
                    "Passport-size photographs",
                    "Bank statement (last 3 months)",
                    "Travel itinerary / hotel bookings",
                    "Return flight tickets",
                  ].map((doc) => (
                    <li key={doc} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA or coming soon */}
              {country.hasLivePage && country.slug ? (
                <div className="mt-5 space-y-2.5">
                  <Link
                    href={`/apply/${country.slug}/tourist`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300 active:scale-95"
                    onClick={onClose}
                  >
                    Apply for tourist visa
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/apply/${country.slug}/business`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    onClick={onClose}
                  >
                    Business visa
                  </Link>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Coming soon on Consular
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    We're working on adding {country.name}
                  </p>
                </div>
              )}

              {/* ── Flights & Hotels search ── */}
              <TravelSearch country={country} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
