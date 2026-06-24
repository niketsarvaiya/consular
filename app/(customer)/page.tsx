import Link from "next/link";
import { ArrowRight, Shield, FileCheck, ClipboardList, Star, CheckCircle, Globe, Zap, Users } from "lucide-react";
import { COUNTRY_HERO_IMAGES } from "@/lib/visa-content";
import { Reveal } from "@/components/shared/Reveal";
import { CountUp } from "@/components/shared/CountUp";
import { HeroSlideshow } from "@/components/customer/HeroSlideshow";

const FEATURED = [
  { code: "AE", name: "UAE", label: "Tourist Visa", time: "3–5 days" },
  { code: "TH", name: "Thailand", label: "Visa-free", time: "Instant" },
  { code: "SG", name: "Singapore", label: "Entry Visa", time: "5–7 days" },
  { code: "JP", name: "Japan", label: "Visitor Visa", time: "5–7 days" },
  { code: "NZ", name: "New Zealand", label: "Visitor Visa", time: "10–14 days" },
  { code: "CA", name: "Canada", label: "TRV", time: "70–99 days" },
];

const STATS = [
  { value: "10,000+", label: "Indian travellers helped" },
  { value: "12+", label: "Destinations covered" },
  { value: "98%", label: "Approval rate" },
  { value: "4.8★", label: "Customer rating" },
];

// Rotating full-bleed hero backgrounds — different travel styles
const HERO_SLIDES = [
  { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=80&auto=format&fit=crop", alt: "A bright turquoise tropical shoreline" },
  { src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=80&auto=format&fit=crop", alt: "A grand city skyline at golden hour" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80&auto=format&fit=crop", alt: "Snow-capped mountain peaks above a still lake" },
  { src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=2000&q=80&auto=format&fit=crop", alt: "An aircraft wing above the clouds at golden hour" },
];

// Overlapping destination thumbnails for the hero
const HERO_THUMBS = [
  { code: "JP", name: "Japan", rotate: "-8deg" },
  { code: "AE", name: "Dubai", rotate: "-2deg" },
  { code: "TH", name: "Thailand", rotate: "4deg" },
  { code: "SG", name: "Singapore", rotate: "10deg" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Globe,
    iconBg: "bg-coral-50",
    iconColor: "text-coral-600",
    title: "Pick your destination",
    description: "Browse 12+ countries with verified, official-source visa requirements. Filter by visa type, processing time, or fee.",
  },
  {
    step: "02",
    icon: ClipboardList,
    iconBg: "bg-iris-50",
    iconColor: "text-iris-600",
    title: "Get your personalised checklist",
    description: "We generate a precise, country-specific document list based on your profile. No guesswork, no missing papers.",
  },
  {
    step: "03",
    icon: FileCheck,
    iconBg: "bg-azure-50",
    iconColor: "text-azure-600",
    title: "Upload & we review",
    description: "Upload once. Our team reviews everything — flags issues, corrects formats, and ensures nothing slips through.",
  },
  {
    step: "04",
    icon: Shield,
    iconBg: "bg-sage-50",
    iconColor: "text-sage-700",
    title: "We file. You travel.",
    description: "We handle the paperwork and submission. You get real-time updates until your visa lands in your inbox.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    location: "Mumbai → Singapore",
    stars: 5,
    quote: "I was dreading the visa process, but VisaSetGo made it feel like nothing at all. My documents were reviewed overnight and I got my visa in four days. Absolutely brilliant service.",
  },
  {
    name: "Rohan M.",
    location: "Bengaluru → United Kingdom",
    stars: 5,
    quote: "Applied for a UK business visa — notoriously stressful. The checklist was so clear, I knew what to prepare weeks in advance. The team caught an error in my bank statement before I submitted.",
  },
  {
    name: "Anjali K.",
    location: "Delhi → Australia",
    stars: 5,
    quote: "Felt like having a knowledgeable friend in my corner. Every time I had a question, someone responded within the hour. I'll never go back to doing this on my own.",
  },
];

const WHY_VISASETGO = [
  { icon: CheckCircle, title: "Official sources only", description: "Every policy is backed by embassy and government sources — not travel blogs." },
  { icon: Zap, title: "Freshness badges", description: "We mark when each country's requirements were last verified so you always have current info." },
  { icon: Users, title: "Real human review", description: "A real ops specialist checks your documents before anything goes out." },
  { icon: Shield, title: "Data encrypted", description: "Passport data is AES-256 encrypted. We never share your documents without consent." },
];

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* ── HERO — full viewport ── */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
        {/* Full-bleed rotating travel images (crossfade) */}
        <HeroSlideshow slides={HERO_SLIDES} />
        {/* Soft legibility scrim — kept light so the image stays bright */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink-900/75 via-ink-900/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-ink-900/55 to-transparent" />

        {/* Right-side overlay: product cards (top) + destination thumbnails (bottom) */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="relative mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Floating product cards — top right */}
            <div className="absolute right-4 top-10 flex flex-col items-end gap-4 sm:right-6 lg:right-8">
              <div className="animate-float flex items-center gap-3 rounded-2xl border border-white/40 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-50 text-sage">
                  <CheckCircle className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-bold leading-tight text-ink">Visa approved</p>
                  <p className="text-[11px] leading-tight text-ink-400">Japan · 4 days</p>
                </div>
              </div>
              <div className="animate-float rounded-2xl border border-white/40 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur" style={{ animationDelay: "1.3s" }}>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-sm font-bold text-ink">4.8</span>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-400">Loved by 10,000+ travellers</p>
              </div>
            </div>

            {/* Overlapping destination thumbnails — bottom right */}
            <div className="pointer-events-auto absolute bottom-10 right-4 flex items-end sm:right-6 lg:right-8">
              {HERO_THUMBS.map((t, i) => {
                const img = COUNTRY_HERO_IMAGES[t.code]?.[0] ?? "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80";
                return (
                  <Reveal key={t.code} delay={0.25 + i * 0.08}>
                    <div
                      className="relative -ml-7 h-40 w-32 overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white/90 transition-transform duration-300 first:ml-0 hover:z-10 hover:-translate-y-2"
                      style={{ rotate: t.rotate }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={t.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://flagcdn.com/w40/${t.code.toLowerCase()}.png`} alt="" className="h-3 w-4 rounded-[2px] object-cover" />
                        <span className="text-xs font-bold text-white">{t.name}</span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copy — vertically centred */}
        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sage-300" />
              </span>
              Verified visa data — updated from official sources
            </div>

            <h1 className="text-4xl font-bold leading-[1.04] tracking-tight text-white [text-shadow:0_2px_20px_rgba(13,14,18,0.55)] sm:text-5xl lg:text-6xl">
              Your visa,{" "}
              <span className="bg-gradient-to-r from-coral-400 via-coral-400 to-iris-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
                handled with care.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgba(13,14,18,0.5)]">
              VisaSetGo guides Indian passport holders through every step — from verified, official-source checklists to expert human document review.
            </p>

            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href="/destinations"
                className="group flex items-center gap-2 rounded-2xl bg-sunset px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
              >
                Browse destinations <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                Create free account
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/70 [text-shadow:0_1px_8px_rgba(13,14,18,0.5)]">
              Free to start · No card required · 12+ countries covered
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Stats band (below the fold) ── */}
      <section className="border-b border-ink/5 bg-white">
        <Reveal className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-12 sm:grid-cols-4 sm:px-6 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-ink/10 bg-white px-4 py-5 text-center shadow-sm">
              <p className="text-2xl font-bold text-ink"><CountUp value={s.value} /></p>
              <p className="mt-1 text-xs text-ink-400">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ── FEATURED DESTINATIONS ── */}
      <section className="border-b border-ink/5 bg-ivory-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Top picks</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Popular for Indian travellers</h2>
            </div>
            <Link href="/destinations" className="hidden items-center gap-1 text-sm font-medium text-gold-700 hover:text-gold-800 sm:flex">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {FEATURED.map((d, i) => {
              const img = COUNTRY_HERO_IMAGES[d.code]?.[0] ?? "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80";
              return (
                <Reveal key={d.code} delay={i * 0.06}>
                <Link
                  href={`/apply/${d.code.toLowerCase()}/tourist`}
                  className="group relative block overflow-hidden rounded-2xl bg-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ height: "180px" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={d.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/w40/${d.code.toLowerCase()}.png`} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
                      <span className="text-sm font-bold text-white">{d.name}</span>
                    </div>
                    <p className="text-[10px] text-white/55">{d.label} · {d.time}</p>
                  </div>
                </Link>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link href="/destinations" className="text-sm font-medium text-gold-700 hover:underline">
              View all destinations →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">How VisaSetGo works</p>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            From planning to approval in 4 steps
          </h2>
          <p className="mt-4 text-base text-slate-500">
            We sit beside you through the entire process — not just hand you a form and disappear.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.08} className="h-full">
              <div className="group relative h-full rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 flex items-start justify-between">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <span className="text-3xl font-black tracking-tight text-slate-100">{item.step}</span>
                </div>
                <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WHY CONSULAR ── */}
      <section className="bg-gradient-to-br from-ink to-ink-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Why VisaSetGo</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Built on truth, not guesswork</h2>
            <p className="mt-4 text-base text-white/55">
              We source every requirement directly from embassies and government portals — and we show you exactly when we last checked.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_VISASETGO.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:bg-white/[0.08]">
                  <item.icon className="mb-4 h-6 w-6 text-iris-300" />
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gradient-to-b from-iris-50/40 to-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Stories from our travellers</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Real journeys, real care</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1} className="h-full">
              <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-50 text-xs font-bold text-gold-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-sunset px-8 py-20 text-center shadow-xl shadow-iris-600/30">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="relative">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">Your journey starts here</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to travel?<br className="hidden sm:block" /> We&apos;ll handle the paperwork.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-white/80">
              Tell us where you want to go, and we&apos;ll handle everything from document checklist to submission.
            </p>
            <Link
              href="/destinations"
              className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-9 py-4 text-sm font-semibold text-ink shadow-lg shadow-black/25 transition-colors hover:bg-ink-50"
            >
              Start your application <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-5 text-xs text-ivory/50">Free to start · No card required</p>
          </div>
        </div>
      </section>

    </div>
  );
}
