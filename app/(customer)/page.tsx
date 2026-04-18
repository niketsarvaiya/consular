import Link from "next/link";
import { ArrowRight, Shield, Clock, FileCheck, Globe } from "lucide-react";

const FEATURES = [
  { icon: Globe, title: "Country-specific guidance", description: "Every destination has its own requirements. We maintain accurate, up-to-date checklists for each." },
  { icon: FileCheck, title: "Document-first workflow", description: "Know exactly what to upload before you pay. No surprises mid-process." },
  { icon: Clock, title: "Transparent timelines", description: "Real processing time estimates based on current embassy conditions, not guesswork." },
  { icon: Shield, title: "Secure document handling", description: "Your passport and personal documents are encrypted, stored securely, and never shared without your consent." },
];

const DESTINATIONS = [
  { name: "UAE", flag: "🇦🇪", time: "3–5 days", type: "e-Visa" },
  { name: "Thailand", flag: "🇹🇭", time: "On arrival", type: "Visa-free" },
  { name: "Singapore", flag: "🇸🇬", time: "5–7 days", type: "e-Visa" },
  { name: "New Zealand", flag: "🇳🇿", time: "7–10 days", type: "e-Visa" },
  { name: "United Kingdom", flag: "🇬🇧", time: "15–20 days", type: "Sticker Visa" },
  { name: "Australia", flag: "🇦🇺", time: "15–30 days", type: "e-Visa" },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            For Indian Passport Holders
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Visa processing that works<br />
            <span className="text-slate-400">the way it should.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500">A structured, transparent process for Indian passport holders to apply for tourist and business visas. Know exactly what to submit, track every step.</p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/destinations" className="flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              Browse destinations <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/auth/register" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-400">Popular destinations for Indian passport holders</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {DESTINATIONS.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="text-xl">{d.flag}</span>
                <div><span className="text-sm font-medium text-slate-700">{d.name}</span><span className="ml-2 text-xs text-slate-400">{d.type} · {d.time}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Built for the process, not the brochure</h2>
          <p className="mt-4 text-slate-500">Most visa platforms show you pretty pages. We show you exactly what to do and when.</p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <feature.icon className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold text-white">Ready to apply?</h2>
          <p className="mt-4 text-slate-400">Choose your destination and get a personalised document checklist in minutes.</p>
          <Link href="/destinations" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100">
            Start your application <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-xs text-slate-500">For Indian passport holders only in this version.</p>
        </div>
      </section>
    </div>
  );
}
