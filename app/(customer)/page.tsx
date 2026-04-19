import Link from "next/link";
import { ArrowRight, Shield, FileCheck, ClipboardList } from "lucide-react";

const DESTINATIONS = [
  { name: "UAE", code: "ae", time: "3–5 days", type: "e-Visa" },
  { name: "Thailand", code: "th", time: "On arrival", type: "Visa-free" },
  { name: "Singapore", code: "sg", time: "5–7 days", type: "e-Visa" },
  { name: "New Zealand", code: "nz", time: "7–10 days", type: "e-Visa" },
  { name: "United Kingdom", code: "gb", time: "15–20 days", type: "Sticker Visa" },
  { name: "Australia", code: "au", time: "15–30 days", type: "e-Visa" },
];

const HOW_WE_HELP = [
  {
    icon: ClipboardList,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "We prepare your checklist",
    description:
      "Every destination is different. We give you a personalised, country-specific document list so you always know exactly what to gather — before you start.",
  },
  {
    icon: FileCheck,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "We review your documents",
    description:
      "Upload once, and we check everything. Our team flags missing items, wrong formats, or expired documents so nothing slips through the cracks.",
  },
  {
    icon: Shield,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "We handle the paperwork",
    description:
      "From form filling to final submission, we manage every detail on your behalf. Your documents are encrypted and never shared without your consent.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    location: "Mumbai → Singapore",
    stars: 5,
    quote:
      "I was dreading the visa process, but Consular made it feel like nothing at all. My documents were reviewed overnight and I got my e-Visa in four days. Absolutely brilliant service.",
  },
  {
    name: "Rohan M.",
    location: "Bengaluru → United Kingdom",
    stars: 5,
    quote:
      "Applied for a UK business visa — notoriously stressful. The checklist was so clear, I knew what to prepare weeks in advance. The team caught an error in my bank statement before I submitted. Worth every rupee.",
  },
  {
    name: "Anjali K.",
    location: "Delhi → Australia",
    stars: 5,
    quote:
      "Felt like having a knowledgeable friend in my corner. Every time I had a question, someone responded within the hour. I'll never go back to doing this on my own.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        {/* Soft background accent blobs */}
        <div className="pointer-events-none absolute -top-24 right-0 h-[480px] w-[480px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-32 h-64 w-64 rounded-full bg-amber-50/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Trust pill */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Trusted by 10,000+ Indian travellers
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your visa,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                handled with care.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
              We guide Indian passport holders through every step — so you can
              focus on the journey ahead, not the paperwork.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/destinations"
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300"
              >
                Browse destinations <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Create free account
              </Link>
            </div>

            {/* Trust micro-line */}
            <p className="mt-5 text-xs text-slate-400">
              Free to start · No card required · 25+ countries covered
            </p>
          </div>
        </div>
      </section>

      {/* ── Destination pills ────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Popular destinations for Indian passport holders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {DESTINATIONS.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://flagcdn.com/w40/${d.code}.png`}
                  alt={d.name}
                  width={22}
                  height={15}
                  className="rounded-sm object-cover shadow-sm"
                />
                <span className="text-sm font-semibold text-slate-800">{d.name}</span>
                <span className="text-xs text-slate-400">{d.type}</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                  {d.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How we help ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">
            The Consular way
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            We&apos;re with you at every step
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Most visa services hand you a form and disappear. We stay by your
            side — from your first question to your boarding pass.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {HOW_WE_HELP.map((item, i) => (
            <div
              key={item.title}
              className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Step number */}
              <div className="absolute right-6 top-6 text-[11px] font-bold tracking-widest text-slate-200">
                0{i + 1}
              </div>
              <div
                className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}
              >
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-indigo-50/60 to-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">
              Stories from our travellers
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Real journeys, real care
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Stars */}
                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="flex-1 text-sm leading-relaxed text-slate-600">
                  &ldquo;{t.quote}&rdquo;
                </p>

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

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-20 text-center shadow-xl shadow-indigo-900/20">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-white/5" />

          <div className="relative">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-300">
              Your journey starts here
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to travel? We&apos;ll take care
              <br className="hidden sm:block" /> of the paperwork.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-indigo-200">
              Tell us where you want to go, and we&apos;ll handle everything from
              document checklist to submission.
            </p>
            <Link
              href="/destinations"
              className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-9 py-4 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 transition-colors hover:bg-indigo-50"
            >
              Start your application <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-5 text-xs text-indigo-400">
              Free to start · No card required
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
