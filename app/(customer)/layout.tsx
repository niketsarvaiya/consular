import { CustomerNav } from "@/components/customer/CustomerNav";
import Link from "next/link";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNav />
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-ink text-ivory">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          {/* Main footer grid */}
          <div className="grid gap-10 sm:grid-cols-3">

            {/* Left — Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <span className="font-display text-sm font-semibold text-gold">VS</span>
                </div>
                <span className="font-display text-xl font-semibold text-ivory">VisaSetGo</span>
              </div>
              <p className="mt-3 text-sm font-medium text-ivory/60">
                Your personal visa concierge
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
                </span>
                <span className="text-xs font-medium text-ivory/70">
                  Trusted by 10,000+ Indian travellers
                </span>
              </div>
            </div>

            {/* Center — Links */}
            <div className="flex flex-col items-start gap-3 sm:items-center">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold/80">
                Navigate
              </p>
              <nav className="flex flex-col items-start gap-2.5 sm:items-center">
                {[
                  { href: "/destinations", label: "Destinations" },
                  { href: "/explore", label: "Explore Map" },
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact Us" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm font-medium text-ivory/70 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right — Support */}
            <div className="sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gold/80">
                Need help?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ivory/60">
                Our team is here for you. Write to us anytime and we&apos;ll
                get back to you promptly.
              </p>
              <a
                href="mailto:support@visasetgo.com"
                className="mt-3 inline-block text-sm font-semibold text-gold transition-colors hover:text-gold-300"
              >
                support@visasetgo.com
              </a>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <p className="text-xs font-medium text-ivory/70">
                  We respond within 2 hours
                </p>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-14 border-t border-white/10 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <p className="text-xs text-ivory/45">
                © {new Date().getFullYear()} VisaSetGo. Made with care for Indian travellers.
              </p>
              <p className="text-xs leading-relaxed text-ivory/45">
                Visa approval is at the sole discretion of the respective embassy.
                VisaSetGo facilitates the process only and does not guarantee approval.
              </p>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
