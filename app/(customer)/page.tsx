import Link from "next/link";
import { ArrowRight, Shield, Clock, FileCheck, Globe } from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Country-specific guidance",
    description: "Every destination has its own requirements. We maintain accurate, up-to-date checklists for each.",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: FileCheck,
    title: "Document-first workflow",
    description: "Know exactly what to upload before you pay. No surprises mid-process.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: Clock,
    title: "Transparent timelines",
    description: "Real processing time estimates based on current embassy conditions, not guesswork.",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Shield,
    title: "Secure document handling",
    description: "Your passport and personal documents are encrypted, stored securely, and never shared without your consent.",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
];

const DESTINATIONS = [
  { name: "UAE", code: "ae", time: "3–5 days", type: "e-Visa" },
  { name: "Thailand", code: "th", time: "On arrival", type: "Visa-free" },
  { name: "Singapore", code: "sg", time: "5–7 days", type: "e-Visa" },
  { name: "New Zealand", code: "nz", time: "7–10 days", type: "e-Visa" },
  { name: "United Kingdom", code: "gb", time: "15–20 days", type: "Sticker Visa" },
  { name: "Australia", code: "au", time: "15–30 days", type: "e-Visa" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Social proof pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-700/50 bg-indigo-900/60 px-4 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Trusted by Indians travelling to 25+ countries
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Visa processing that works
              <br />
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                the way it should.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-indigo-200/80">
              A structured, transparent process for Indian passport holders to apply for tourist and business visas.
              Know exactly what to submit, track every step.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/destinations"
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-all hover:bg-indigo-400 hover:shadow-indigo-700/40"
              >
                Browse destinations <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 rounded-xl border border-indigo-700/60 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Create free account
              </Link>
            </div>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Destinations strip */}
      <section className="border-b border-slate-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Popular destinations for Indian passport holders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {DESTINATIONS.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://flagcdn.com/w40/${d.code}.png`}
                  alt={d.name}
                  width={20}
                  height={14}
                  className="rounded-sm object-cover"
                />
                <span className="text-sm font-medium text-slate-800">{d.name}</span>
                <span className="text-xs text-slate-400">{d.type}</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  {d.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Built for the process, not the brochure
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Most visa platforms show you pretty pages. We show you exactly what to do and when.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg}`}>
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-16 text-center shadow-xl shadow-indigo-900/20">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-white">Ready to apply?</h2>
            <p className="mt-4 text-indigo-100">
              Choose your destination and get a personalised document checklist in minutes.
            </p>
            <Link
              href="/destinations"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition-colors hover:bg-indigo-50"
            >
              Start your application <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-6 text-xs text-indigo-300">For Indian passport holders only in this version.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
