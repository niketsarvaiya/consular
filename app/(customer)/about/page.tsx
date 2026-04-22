import Link from "next/link";
import { ArrowRight, Shield, Globe, Users, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us – Consular",
  description: "We're building the most honest, transparent visa service for Indian passport holders.",
};

const VALUES = [
  {
    icon: CheckCircle,
    title: "Truth over comfort",
    description: "We source requirements directly from embassies and government portals. If a destination is hard, we tell you — with the data to back it up.",
  },
  {
    icon: Globe,
    title: "Freshness as a feature",
    description: "Visa rules change often. Every policy on Consular shows exactly when it was last verified against its official source.",
  },
  {
    icon: Users,
    title: "Real humans, real review",
    description: "Behind every application is a specialist who actually reads your documents — not just a checklist bot.",
  },
  {
    icon: Shield,
    title: "Privacy by design",
    description: "Passport data is AES-256 encrypted at rest. We never sell, share, or reuse your information without explicit consent.",
  },
];

const TEAM = [
  {
    initials: "RS",
    name: "Rinkesh S.",
    role: "Co-founder",
    description: "A lifelong travel enthusiast who built and ran a travel agency for years. Rinkesh saw first-hand how visa confusion derailed trips and lost clients. He co-founded Consular to fix the gap he lived every single day.",
  },
  {
    initials: "NS",
    name: "Niket S.",
    role: "Co-founder",
    description: "The tech and operations brain behind Consular. Niket architects the platform, builds the product, and keeps the engine running — so every traveller gets a seamless, reliable experience from checklist to approval.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-indigo-500">About Consular</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Built for Indian travellers.<br />
              <span className="text-indigo-600">Backed by real sources.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
              Consular is a visa assistance platform that combines verified, official-source data with expert human review — so Indian passport holders can travel with confidence, not anxiety.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/destinations" className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700">
                Browse destinations <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50">
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Our story</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              We started because visa paperwork is broken.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-500">
              Every year, millions of Indian travellers spend hours — sometimes days — piecing together visa requirements from outdated blog posts, Facebook groups, and decade-old YouTube videos.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Rejections happen not because applicants aren&apos;t qualified, but because nobody told them their bank statements needed a specific format, or that the processing time doubled last month.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Consular exists to fix that. We go to the source — embassies, government portals, official VFS documentation — and we show you exactly what&apos;s needed, when we verified it, and what&apos;s changed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-indigo-50 p-6">
              <p className="text-4xl font-black text-indigo-600">12+</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Countries covered</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-6">
              <p className="text-4xl font-black text-emerald-600">98%</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Approval rate</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-6">
              <p className="text-4xl font-black text-violet-600">10k+</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Travellers helped</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-6">
              <p className="text-4xl font-black text-amber-600">4.8★</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Customer rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">What drives us</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Our principles</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <v.icon className="mb-4 h-6 w-6 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">The people behind Consular</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">A small team with deep focus</h2>
        </div>
        <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
          {TEAM.map((m) => (
            <div key={m.name} className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-bold text-white">
                {m.initials}
              </div>
              <p className="font-bold text-slate-900">{m.name}</p>
              <p className="text-xs font-medium text-indigo-600 mt-0.5">{m.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{m.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-indigo-600 to-violet-700 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to start your application?</h2>
          <p className="mx-auto mt-3 max-w-md text-base text-indigo-200">
            Browse 12+ verified destinations and get your personalised visa checklist in minutes.
          </p>
          <Link
            href="/destinations"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-md transition-colors hover:bg-indigo-50"
          >
            Browse destinations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
