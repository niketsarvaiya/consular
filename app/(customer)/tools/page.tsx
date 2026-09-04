import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools",
  description: "Free tools to help you put together a stronger visa application.",
};

const TOOLS = [
  {
    href: "/tools/cover-letter",
    icon: FileText,
    name: "Cover Letter Generator",
    blurb: "Draft a formal, consulate-ready covering letter for every traveller on your trip — individually signed, with the right document checklist for each person.",
    tag: "Free",
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-iris">Tools</p>
      <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
        Small things that make a <span className="text-gradient">stronger application</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-600">
        Free tools you can use whether or not you apply through us.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-iris/40 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sunset text-white">
                <t.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{t.tag}</span>
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-ink">{t.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.blurb}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-iris">
              Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
