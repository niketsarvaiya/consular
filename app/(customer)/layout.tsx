import { CustomerNav } from "@/components/customer/CustomerNav";
import Link from "next/link";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNav />
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          {/* Main footer grid */}
          <div className="grid gap-10 sm:grid-cols-3">

            {/* Left — Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 px-2.5">
                  <span className="text-[10px] font-bold tracking-wide text-white">CO</span>
                </div>
                <span className="text-base font-semibold text-slate-900">Consular</span>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">
                Your personal visa concierge
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-slate-600">
                  Trusted by 10,000+ Indian travellers
                </span>
              </div>
            </div>

            {/* Center — Links */}
            <div className="flex flex-col items-start gap-3 sm:items-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Navigate
              </p>
              <nav className="flex flex-col items-start gap-2.5 sm:items-center">
                <Link href="/destinations" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                  Destinations
                </Link>
                <Link href="/about" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                  About Us
                </Link>
                <Link href="/contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                  Contact Us
                </Link>
                <Link href="/privacy" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                  Terms of Service
                </Link>
              </nav>
            </div>

            {/* Right — Support */}
            <div className="sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Need help?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Our team is here for you. Write to us anytime and we&apos;ll
                get back to you promptly.
              </p>
              <a
                href="mailto:support@consular.in"
                className="mt-3 inline-block text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                support@consular.in
              </a>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <p className="text-xs font-medium text-amber-700">
                  We respond within 2 hours
                </p>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-slate-100 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} Consular. Made with care for Indian travellers.
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                Visa approval is at the sole discretion of the respective embassy.
                Consular facilitates the process only and does not guarantee approval.
              </p>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
