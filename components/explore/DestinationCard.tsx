"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { type ExploreCountry, VISA_STATUS_META } from "@/lib/explore-data";

interface DestinationCardProps {
  country: ExploreCountry;
  onClick?: (c: ExploreCountry) => void;
  index?: number;
}

export function DestinationCard({ country, onClick, index = 0 }: DestinationCardProps) {
  const meta = VISA_STATUS_META[country.visaStatus];

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer"
      onClick={() => onClick?.(country)}
    >
      {/* Hero image */}
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {country.heroImage ? (
          <img
            src={country.heroImage}
            alt={country.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {country.flag}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Status badge overlay */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${meta.badge} bg-opacity-90`}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.mapColor }} />
            {meta.label}
          </span>
        </div>

        {/* Trending badge */}
        {country.trending && (
          <div className="absolute right-2.5 top-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
              <Zap className="h-2.5 w-2.5" />
              Trending
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900 leading-snug">
              {country.flag} {country.name}
            </p>
            {country.tagline && (
              <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                {country.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Processing + fee row */}
        {(country.processingDays || country.totalFeeINR !== undefined) && (
          <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500">
            {country.processingDays && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {country.processingDays}
              </div>
            )}
            {country.totalFeeINR !== undefined && (
              <div className="flex items-center gap-1">
                <span>from</span>
                <span className="font-semibold text-slate-700">
                  {country.totalFeeINR === 0
                    ? "Free"
                    : `₹${country.totalFeeINR.toLocaleString("en-IN")}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {country.hasLivePage && country.slug && (
          <Link
            href={`/apply/${country.slug}/tourist`}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 py-2 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
          >
            Apply now <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </motion.div>
  );

  return content;
}
