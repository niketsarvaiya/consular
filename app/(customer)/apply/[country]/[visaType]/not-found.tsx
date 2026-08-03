import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function DestinationNotFound() {
  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-white px-4">
      {/* soft sunset glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-coral-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-azure-100/50 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-iris-100/40 blur-3xl" />

      <div className="relative max-w-lg text-center">
        {/* animated globe/plane mark */}
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-sunset shadow-xl shadow-iris-600/30">
          <span className="animate-float text-6xl">🧳</span>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">Not on the map — yet</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          We&apos;re still getting this{" "}
          <span className="text-gradient">destination on board.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-500">
          Our team is busy verifying the latest visa rules for this country from
          official sources. It&apos;s not live just yet — but plenty of other
          destinations are ready for you to explore.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/destinations"
            className="group flex items-center gap-2 rounded-2xl bg-sunset px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-iris-600/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
          >
            <Compass className="h-4 w-4" />
            Browse live destinations
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-ink/15 bg-white px-7 py-3.5 text-sm font-semibold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-ink/25"
          >
            Back home
          </Link>
        </div>

        <p className="mt-6 text-xs text-ink-400">
          Want this country next? Tell us at{" "}
          <a href="mailto:support@visasetgo.com" className="font-medium text-iris-600 hover:underline">support@visasetgo.com</a>.
        </p>
      </div>
    </div>
  );
}
