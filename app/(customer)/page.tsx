import Link from "next/link";
import { ArrowRight, Shield, FileCheck, ClipboardList, Star, CheckCircle, Globe, Zap, Users } from "lucide-react";
import { COUNTRY_HERO_IMAGES } from "@/lib/visa-content";

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

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Globe,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "Pick your destination",
    description: "Browse 12+ countries with verified, official-source visa requirements. Filter by visa type, processing time, or fee.",
  },
  {
    step: "02",
    icon: ClipboardList,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Get your personalised checklist",
    description: "We generate a precise, country-specific document list based on your profile. No guesswork, no missing papers.",
  },
  {
    step: "03",
    icon: FileCheck,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Upload & we review",
    description: "Upload once. Our team reviews everything — flags issues, corrects formats, and ensures nothing slips through.",
  },
  {
    step: "04",
    icon: Shield,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "We file. You travel.",
    description: "We handle the paperwork and submission. You get real-time updates until your visa lands in your inbox.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    location: "Mumbai → Singapore",
    stars: 5,
    quote: "I was dreading the visa process, but Consular made it feel like nothing at all. My documents were reviewed overnight and I got my visa in four days. Absolutely brilliant service.",
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

const WHY_CONSULAR = [
  { icon: CheckCircle, title: "Official sources only", description: "Every policy is backed by embassy and government sources — not travel blogs." },
  { icon: Zap, title: "Freshness badges", description: "We mark when each country's requirements were last verified so you always have current info." },
  { icon: Users, title: "Real human review", description: "A real ops specialist checks your documents before anything goes out." },
  { icon: Shield, title: "Data encrypted", description: "Passport data is AES-256 encrypted. We never share your documents without consent." },
];

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-slate-900/50 to-slate-950/90" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">

            {/* Live badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Verified visa data — updated from official sources
            </div>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your visa,{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
                handled with care.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/65">
              Consular guides Indian passport holders through every step of the visa process — from verified checklists to expert document review.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/destinations"
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition-all hover:bg-indigo-500 hover:shadow-indigo-800/50"
              >
                Browse destinations <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
              >
                Create free account
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/40">
              Free to start · No card required · 12+ countries covered
            </p>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DESTINATIONS ── */}
      <section className="border-b border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Top picks</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Popular for Indian travellers</h2>
            </div>
            <Link href="/destinations" className="hidden items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:flex">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {FEATURED.map((d) => {
              const img = COUNTRY_HERO_IMAGES[d.code]?.[0] ?? "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80";
              return (
                <Link
                  key={d.code}
                  href={`/apply/${d.code.toLowerCase()}/tourist`}
                  className="group relative overflow-hidden rounded-2xl bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
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
              );
            })}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link href="/destinations" className="text-sm font-medium text-indigo-600 hover:underline">
              View all destinations →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">How Consular works</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            From planning to approval in 4 steps
          </h2>
          <p className="mt-4 text-base text-slate-500">
            We sit beside you through the entire process — not just hand you a form and disappear.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="relative rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="mb-5 flex items-start justify-between">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconBg}`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <span className="text-3xl font-black tracking-tight text-slate-100">{item.step}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY CONSULAR ── */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Why Consular</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Built on truth, not guesswork</h2>
            <p className="mt-4 text-base text-white/55">
              We source every requirement directly from embassies and government portals — and we show you exactly when we last checked.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CONSULAR.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm">
                <item.icon className="mb-4 h-6 w-6 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Stories from our travellers</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Real journeys, real care</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-20 text-center shadow-xl shadow-indigo-900/20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="relative">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-300">Your journey starts here</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to travel?<br className="hidden sm:block" /> We&apos;ll handle the paperwork.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-indigo-200">
              Tell us where you want to go, and we&apos;ll handle everything from document checklist to submission.
            </p>
            <Link
              href="/destinations"
              className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-9 py-4 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition-colors hover:bg-indigo-50"
            >
              Start your application <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-5 text-xs text-indigo-400">Free to start · No card required</p>
          </div>
        </div>
      </section>

    </div>
  );
}
