"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Clock, CreditCard, FileText,
  ShieldCheck, CalendarDays, ChevronDown, Lock, Users,
  Info, ChevronRight, Zap,
} from "lucide-react";
import type { FAQCategory } from "@/lib/visa-content";

interface FeeDetails {
  governmentFeeINR: number;
  serviceFeeINR: number;
  taxes?: number;
  notes?: string;
}

interface RequiredDoc {
  title: string;
  key: string;
  notes?: string;
}

interface Props {
  countryName: string;
  countryCode: string;
  countryFlagUrl: string | null;
  visaTypeLabel: string;
  categoryLabel: string;
  categoryColor: string;
  totalFee: number;
  fee: FeeDetails | null;
  processingTimeMin: number | null;
  processingTimeMax: number | null;
  processingNotes: string | null;
  reqDocs: RequiredDoc[];
  heroImages: string[];
  countryInfo: { tagline: string; description: string; highlights: string[] };
  faqData: FAQCategory[];
  successTips: string[];
  isLoggedIn: boolean;
  applyPath: string;
  registerPath: string;
  loginPath: string;
}

const STEPS = [
  { icon: FileText,     num: "01", title: "Enter passport details",    desc: "Securely stored and reused across all your future applications." },
  { icon: CheckCircle2, num: "02", title: "Upload your documents",      desc: "A precise country-specific checklist — no guesswork, no missing items." },
  { icon: CreditCard,   num: "03", title: "Pay only after approval",    desc: "No upfront payment. We review every document before you're charged." },
  { icon: CalendarDays, num: "04", title: "We file and track your visa", desc: "From submission to stamp — we handle every embassy interaction for you." },
];

const WHY_CONSULAR = [
  { icon: ShieldCheck, title: "Embassy-grade review",      desc: "Every document verified by specialists before submission." },
  { icon: Zap,         title: "Real-time updates",         desc: "Track every stage. Notified the moment anything changes." },
  { icon: Lock,        title: "Bank-grade security",       desc: "Passport data encrypted end-to-end. Never shared." },
  { icon: Users,       title: "Dedicated case manager",    desc: "One expert, your whole application. Replies within 2 hours." },
];

const ELIGIBILITY_RULES = [
  "Valid Indian passport — at least 6 months' validity beyond your departure date",
  "Sufficient funds — bank statements showing a consistent balance",
  "Clear purpose of visit — tourism, family, or business",
  "Ties to India — employment, property, or dependants proving intent to return",
  "No prior immigration violations or criminal history in the destination country",
];

export function VisaPageClient({
  countryName, countryCode, countryFlagUrl, visaTypeLabel, categoryLabel,
  totalFee, fee, processingTimeMin, processingTimeMax, processingNotes,
  reqDocs, heroImages, faqData, successTips,
  isLoggedIn, applyPath, registerPath, loginPath,
}: Props) {
  const [faqCat, setFaqCat] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const processingText = processingTimeMin && processingTimeMax
    ? `${processingTimeMin}–${processingTimeMax} days`
    : "Varies";

  const ctaHref = isLoggedIn ? applyPath : registerPath;
  const activeFaqQuestions = faqData[faqCat]?.questions ?? [];

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-slate-900" style={{ height: "520px" }}>

        {/* Desktop mosaic */}
        <div className="hidden md:grid h-full gap-0.5" style={{ gridTemplateColumns: "3fr 1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImages[0]} alt={countryName} className="h-full w-full object-cover" style={{ gridRow: "1 / 3" }} />
          {[1, 2, 3, 4].map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={heroImages[i]} alt="" className="h-full w-full object-cover" />
          ))}
        </div>
        {/* Mobile single image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImages[0]} alt={countryName} className="md:hidden absolute inset-0 h-full w-full object-cover" />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-900/40 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-5 left-0 right-0 px-4 md:px-8">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Link href="/destinations" className="hover:text-white/70 transition-colors">Destinations</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{countryName}</span>
            <ChevronRight className="h-3 w-3" />
            <span>{visaTypeLabel} Visa</span>
          </div>
        </div>

        {/* Hero bottom — title + stats + CTA */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 md:px-8">

          {/* Title row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                {countryFlagUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={countryFlagUrl} alt="" className="h-6 w-9 rounded-sm object-cover" />
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {countryName} Visa
                </h1>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                  {categoryLabel}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] text-white/40">{visaTypeLabel} · Indian passport holders</p>
            </div>

            {/* CTA — visible above the fold on desktop */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                href={ctaHref}
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-100 transition-colors shadow-lg"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              {!isLoggedIn && (
                <Link href={loginPath} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                  Log in
                </Link>
              )}
            </div>
          </div>

          {/* Key stats row */}
          <div className="mt-5 flex items-center gap-6 md:gap-8">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/35">Visa fee</p>
              <p className="text-base font-bold text-white mt-0.5">
                {totalFee > 0 ? `₹${totalFee.toLocaleString("en-IN")}` : "Free"}
              </p>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/35">Processing</p>
              <p className="text-base font-bold text-white mt-0.5">{processingText}</p>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/35">Documents</p>
              <p className="text-base font-bold text-white mt-0.5">{reqDocs.length} items</p>
            </div>
            <div className="h-6 w-px bg-white/15 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/35">Visa type</p>
              <p className="text-base font-bold text-white mt-0.5">{categoryLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="flex flex-col lg:flex-row gap-14 items-start">

          {/* ── LEFT — open layout ────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* 1. Required documents */}
            <section>
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-xl font-bold text-slate-900">Required documents</h2>
                <span className="text-sm text-slate-400">{reqDocs.length} items</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Everything needed to complete your {countryName} {visaTypeLabel} Visa application.</p>

              <div className="divide-y divide-slate-100">
                {reqDocs.map((doc, i) => (
                  <div key={doc.key} className="flex items-start gap-4 py-4 group">
                    <span className="text-xs tabular-nums text-slate-300 w-5 shrink-0 pt-0.5 font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900 leading-snug">{doc.title}</p>
                      {doc.notes && (
                        <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">{doc.notes}</p>
                      )}
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-slate-200 mt-0.5 group-hover:text-emerald-400 transition-colors" />
                  </div>
                ))}
              </div>

              {/* Success tips — compact, below docs */}
              {successTips.length > 0 && (
                <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50/60 p-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">Expert tips</p>
                  <ul className="space-y-1.5">
                    {successTips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <div className="my-10 border-t border-slate-100" />

            {/* 2. Eligibility */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Eligibility</h2>
              <p className="text-sm text-slate-500 mb-6">Core requirements for Indian passport holders applying for a {countryName} {visaTypeLabel} Visa.</p>

              <div className="space-y-3">
                {ELIGIBILITY_RULES.map((rule, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-[15px] text-slate-700 leading-snug">{rule}</p>
                  </div>
                ))}
              </div>

              {processingNotes && (
                <div className="mt-5 flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{processingNotes}</p>
                </div>
              )}
            </section>

            <div className="my-10 border-t border-slate-100" />

            {/* 3. How it works — horizontal grid */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-1">How it works</h2>
              <p className="text-sm text-slate-500 mb-8">Four steps from passport to stamp — we handle the hard parts.</p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                {STEPS.map((step) => (
                  <div key={step.title}>
                    <span className="text-3xl font-black text-slate-100 leading-none tabular-nums select-none">
                      {step.num}
                    </span>
                    <p className="mt-2 text-[15px] font-bold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-10 border-t border-slate-100" />

            {/* 4. FAQ */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Common questions</h2>

              {/* Category tabs */}
              <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
                {faqData.map((cat, i) => (
                  <button
                    key={cat.category}
                    onClick={() => { setFaqCat(i); setOpenFaq(null); }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      faqCat === i
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {activeFaqQuestions.map((item, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-4 py-4 text-left group"
                    >
                      <span className="text-[15px] font-medium text-slate-800 group-hover:text-slate-900 transition-colors">{item.q}</span>
                      <motion.span
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex shrink-0"
                      >
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pb-5 pr-8">
                            <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT — sticky apply card ──────────────────────────────── */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="sticky top-6 space-y-3">

              {/* Apply card */}
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">

                {/* Header */}
                <div className="bg-zinc-950 px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Consular Visa Service</p>
                  <p className="text-[17px] font-bold text-white mt-1">{countryName} {visaTypeLabel} Visa</p>
                </div>

                {/* Fee breakdown */}
                <div className="px-5 py-4 space-y-2.5">
                  {fee && fee.governmentFeeINR != null ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Government fee</span>
                        <span className="text-sm font-semibold text-slate-900">₹{fee.governmentFeeINR.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Consular service</span>
                        <span className="text-sm font-semibold text-slate-900">₹{fee.serviceFeeINR.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Total</span>
                        <span className="text-xl font-bold text-slate-900">₹{totalFee.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">Total</span>
                      <span className="text-xl font-bold text-slate-900">Free</span>
                    </div>
                  )}
                </div>

                {/* Processing pill */}
                <div className="mx-5 mb-4 flex items-center gap-2.5 rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-600">Processing: <span className="font-semibold text-slate-800">{processingText}</span></span>
                </div>

                {/* CTAs */}
                <div className="px-5 pb-5 space-y-2">
                  {isLoggedIn ? (
                    <Link
                      href={applyPath}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                    >
                      Start my application <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={registerPath}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                      >
                        Get started — it&apos;s free <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={loginPath}
                        className="flex w-full items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        I have an account
                      </Link>
                    </>
                  )}
                  <p className="text-center text-[11px] text-slate-400 pt-0.5">Free to start · Pay only after docs approved</p>
                </div>

                {/* Trust row */}
                <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                  {[
                    { icon: Lock,        label: "Secure" },
                    { icon: ShieldCheck, label: "Verified" },
                    { icon: Users,       label: "4.8 / 5" },
                  ].map((b) => (
                    <div key={b.label} className="flex flex-col items-center gap-1 py-3">
                      <b.icon className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500 font-medium">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expert */}
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-sm font-bold shrink-0">C</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Consular Team</p>
                    <p className="text-[11px] text-slate-400">Responds within 2 hours</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 py-2 text-center">
                    <p className="text-[15px] font-bold text-slate-900">2,000+</p>
                    <p className="text-[10px] text-slate-400">Visas processed</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2 text-center">
                    <p className="text-[15px] font-bold text-slate-900">98%</p>
                    <p className="text-[10px] text-slate-400">Approval rate</p>
                  </div>
                </div>
              </div>

              {/* Fee note */}
              {fee?.notes && (
                <div className="flex gap-2.5 rounded-lg border border-amber-100 bg-amber-50 p-3.5 text-xs text-amber-700">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{fee.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile CTA bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-base font-bold text-slate-900">{totalFee > 0 ? `₹${totalFee.toLocaleString("en-IN")}` : "Free"}</p>
          </div>
          <Link
            href={ctaHref}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── WHY CONSULAR — full-width section ────────────────────────────── */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Why Consular</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {WHY_CONSULAR.map((item) => (
              <div key={item.title}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 mb-3">
                  <item.icon className="h-4 w-4 text-slate-700" />
                </div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <div className="bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Ready to travel</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Visit {countryName} — we&apos;ll handle the visa.
              </h3>
              <p className="mt-2 text-white/40 text-sm max-w-lg leading-relaxed">
                Every document, every form, every follow-up. Free to start — you only pay once your application is approved.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                {isLoggedIn ? "Start application" : "Create free account"} <ArrowRight className="h-4 w-4" />
              </Link>
              {!isLoggedIn && (
                <Link href={loginPath} className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
