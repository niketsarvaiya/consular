"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Clock, CreditCard, FileText,
  ShieldCheck, Banknote, CalendarDays, MapPin, ChevronDown,
  Zap, Lock, Users, Star, Info, ChevronRight,
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
  { icon: FileText, title: "Enter passport details", desc: "Securely stored and used across all future applications.", color: "bg-indigo-50 text-indigo-600 ring-indigo-200" },
  { icon: CheckCircle2, title: "Upload your documents", desc: "Our country-specific checklist tells you exactly what to gather — no guesswork.", color: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  { icon: CreditCard, title: "Pay only after approval", desc: "No upfront payment. Our team reviews every document before you're charged.", color: "bg-amber-50 text-amber-600 ring-amber-200" },
  { icon: CalendarDays, title: "We file and track your visa", desc: "From submission to final stamp, we manage every interaction with the embassy.", color: "bg-violet-50 text-violet-600 ring-violet-200" },
];

const WHY_CONSULAR = [
  { icon: ShieldCheck, title: "Embassy-grade verification", desc: "Every document is reviewed by our visa specialists before submission — no surprises." },
  { icon: Zap, title: "Real-time status updates", desc: "Track your application at every stage. We notify you the moment anything changes." },
  { icon: Lock, title: "Bank-grade security", desc: "Your passport data and documents are encrypted end-to-end and never shared." },
  { icon: Users, title: "Dedicated case manager", desc: "One expert handles your entire application and answers questions within 2 hours." },
];

export function VisaPageClient({
  countryName, countryCode, countryFlagUrl, visaTypeLabel, categoryLabel, categoryColor,
  totalFee, fee, processingTimeMin, processingTimeMax, processingNotes,
  reqDocs, heroImages, countryInfo, faqData, successTips,
  isLoggedIn, applyPath, registerPath, loginPath,
}: Props) {
  const [docTab, setDocTab] = useState(0);
  const [faqCat, setFaqCat] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const processingText = processingTimeMin && processingTimeMax
    ? `${processingTimeMin}–${processingTimeMax} days`
    : "Varies";

  const activeFaqQuestions = faqData[faqCat]?.questions ?? [];

  return (
    <div className="bg-white min-h-screen">

      {/* ── MOSAIC HERO ─────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-slate-900" style={{ height: "420px" }}>
        {/* Desktop: mosaic grid */}
        <div className="hidden md:grid h-full gap-1" style={{ gridTemplateColumns: "3fr 1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
          {/* Main large image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImages[0]} alt={countryName} className="h-full w-full object-cover" style={{ gridRow: "1 / 3" }} />
          {/* 4 thumbnails */}
          {[1, 2, 3, 4].map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={heroImages[i]} alt="" className="h-full w-full object-cover" />
          ))}
        </div>
        {/* Mobile: single image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImages[0]} alt={countryName} className="md:hidden absolute inset-0 h-full w-full object-cover" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent pointer-events-none" />

        {/* Breadcrumb */}
        <div className="absolute top-5 left-0 right-0 px-4 md:px-8">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/80">{countryName}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/80">{visaTypeLabel} Visa</span>
          </div>
        </div>

        {/* Hero content — bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-7 md:px-8">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/50">
            <MapPin className="h-3 w-3" /> {countryInfo.tagline}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {countryFlagUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={countryFlagUrl} alt="" className="h-8 w-12 rounded object-cover shadow-md" />
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {countryName} Visa
            </h1>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${categoryColor}`}>
              {categoryLabel}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-white/55">
            {visaTypeLabel} Visa · For Indian passport holders
          </p>
        </div>
      </div>

      {/* ── STAT PILLS STRIP ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex items-stretch gap-0 overflow-x-auto scrollbar-hide">
            {[
              { label: "Visa Fee", value: totalFee > 0 ? `₹${totalFee.toLocaleString("en-IN")}` : "Free", sub: "total incl. service" },
              { label: "Processing Time", value: processingText, sub: "business days" },
              { label: "Docs Required", value: `${reqDocs.length} items`, sub: "full checklist inside" },
              { label: "Visa Type", value: categoryLabel, sub: visaTypeLabel.toLowerCase() },
              { label: "Nationality", value: "Indian", sub: "passport holders" },
            ].map((pill, i) => (
              <div key={i} className="flex-shrink-0 border-r border-slate-100 last:border-r-0 px-5 py-3.5 text-center first:pl-0 md:first:pl-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{pill.label}</p>
                <p className="text-base font-bold text-slate-900 mt-0.5 whitespace-nowrap">{pill.value}</p>
                <p className="text-[10px] text-slate-400 whitespace-nowrap">{pill.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY: TWO-COLUMN LAYOUT ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-7">

            {/* About the Country */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">About {countryName}</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-[15px]">{countryInfo.description}</p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {countryInfo.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-600">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* What You'll Need — Tabbed */}
            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-slate-100">
                {["Documents", "Eligibility", "Success Tips"].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setDocTab(i)}
                    className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                      docTab === i
                        ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Documents tab */}
                {docTab === 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-400 mb-3">All {reqDocs.length} documents required for {countryName} {visaTypeLabel} Visa</p>
                    {reqDocs.map((doc, i) => (
                      <div
                        key={doc.key}
                        className="flex items-start gap-3 rounded-xl border border-slate-100 px-4 py-3.5 transition-all hover:border-indigo-200 hover:bg-indigo-50/30 group"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                          {doc.notes && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{doc.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Eligibility tab */}
                {docTab === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 mb-3">Core eligibility requirements for Indian passport holders</p>
                    {[
                      "Valid Indian passport with at least 6 months validity beyond your planned departure date",
                      "Sufficient funds to cover your stay — bank statements showing consistent balance",
                      "Clear purpose of visit — tourism, family visit, or business",
                      "Strong ties to India — employment, property, or family dependents that prove intent to return",
                      "No criminal history or immigration violations in the destination country",
                      "Good health — medical examination may be required depending on length of stay",
                    ].map((rule, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <p className="text-sm text-slate-700">{rule}</p>
                      </div>
                    ))}
                    {processingNotes && (
                      <div className="mt-4 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{processingNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Success Tips tab */}
                {docTab === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 mb-3">Expert tips to maximise your approval chances</p>
                    {successTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* How It Works */}
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-4 w-4 text-indigo-500" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">How it works</h2>
              </div>
              <div className="space-y-0">
                {STEPS.map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-4 ${step.color}`}>
                        <step.icon className="h-[18px] w-[18px]" />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-px flex-1 bg-gradient-to-b from-slate-200 to-transparent min-h-[28px] my-1" />
                      )}
                    </div>
                    <div className="pb-6 pt-1.5">
                      <p className="font-semibold text-slate-900 text-[15px]">{step.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Frequently Asked Questions</h2>
              </div>

              {/* Category tabs */}
              <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-100">
                {faqData.map((cat, i) => (
                  <button
                    key={cat.category}
                    onClick={() => { setFaqCat(i); setOpenFaq(null); }}
                    className={`flex-shrink-0 px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      faqCat === i
                        ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/30"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* Accordion */}
              <div className="divide-y divide-slate-50">
                {activeFaqQuestions.map((item, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-[15px] font-medium text-slate-800">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Why Consular */}
            <section className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Why Consular</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WHY_CONSULAR.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl bg-white border border-slate-100 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                      <item.icon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN — STICKY APPLY CARD ───────────────────────── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="sticky top-[72px] space-y-4">

              {/* Apply Card */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                {/* Card header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-200">Consular Visa Service</p>
                  <p className="text-lg font-bold text-white mt-0.5">{countryName} {visaTypeLabel} Visa</p>
                </div>

                {/* Fee breakdown */}
                <div className="px-5 py-4 space-y-2.5">
                  {fee ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Government fee</span>
                        <span className="text-sm font-semibold text-slate-900">₹{fee.governmentFeeINR.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Consular service</span>
                        <span className="text-sm font-semibold text-slate-900">₹{fee.serviceFeeINR.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="h-px bg-slate-100 my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">Total</span>
                        <span className="text-xl font-bold text-indigo-600">₹{totalFee.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Total</span>
                      <span className="text-xl font-bold text-indigo-600">Free</span>
                    </div>
                  )}
                </div>

                {/* Processing time */}
                <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5">
                  <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-indigo-700">Processing: {processingText}</span>
                    <p className="text-[10px] text-indigo-400">from document submission</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 space-y-2.5">
                  {isLoggedIn ? (
                    <Link
                      href={applyPath}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-md shadow-indigo-200"
                    >
                      Start my application <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={registerPath}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                      >
                        Get started — it's free <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={loginPath}
                        className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        I have an account
                      </Link>
                    </>
                  )}
                  <p className="text-center text-[11px] text-slate-400">Free to start · Pay only after docs approved</p>
                </div>

                {/* Trust badges */}
                <div className="border-t border-slate-100 px-5 py-3.5 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: Lock, label: "Secure" },
                    { icon: ShieldCheck, label: "Verified" },
                    { icon: Star, label: "4.8 / 5" },
                  ].map((badge) => (
                    <div key={badge.label} className="flex flex-col items-center gap-1">
                      <badge.icon className="h-4 w-4 text-slate-400" />
                      <span className="text-[10px] font-medium text-slate-500">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expert card */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Your visa expert</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    C
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Consular Team</p>
                    <p className="text-[11px] text-slate-400">Responds within 2 hours</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p className="text-base font-bold text-slate-900">2,000+</p>
                    <p className="text-[10px] text-slate-400">Visas processed</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 py-2">
                    <p className="text-base font-bold text-slate-900">98%</p>
                    <p className="text-[10px] text-slate-400">Approval rate</p>
                  </div>
                </div>
              </div>

              {/* Fee note */}
              {fee?.notes && (
                <div className="flex gap-2.5 rounded-xl bg-amber-50 border border-amber-100 p-3.5 text-xs text-amber-700">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{fee.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
        <div className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 p-8 md:p-10 text-center shadow-xl shadow-indigo-100">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm mb-5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Expert-managed from start to finish
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Ready to visit {countryName}?
          </h3>
          <p className="mt-2 text-indigo-200 text-sm md:text-base max-w-md mx-auto">
            We handle every document, every form, every follow-up — so you can focus on planning the trip.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <Link
                href={applyPath}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-md"
              >
                Start my application <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href={registerPath}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-md"
                >
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={loginPath}
                  className="inline-flex items-center rounded-xl border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
          <p className="mt-3 text-xs text-indigo-300">Free to start · No card required · Pay only after approval</p>
        </div>
      </div>
    </div>
  );
}
