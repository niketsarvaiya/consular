import { CustomerNav } from "@/components/customer/CustomerNav";
import Link from "next/link";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Logo + copyright */}
            <div className="flex items-center gap-3">
              <div className="flex h-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 px-2">
                <span className="text-[10px] font-bold tracking-wide text-white">CO</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">Consular</span>
              <span className="text-sm text-slate-400">
                © {new Date().getFullYear()}
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex items-center gap-5">
              <Link
                href="/destinations"
                className="text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600"
              >
                Destinations
              </Link>
              <Link
                href="/privacy"
                className="text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600"
              >
                Terms
              </Link>
            </nav>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-xs leading-relaxed text-slate-400">
              Visa approval is at the sole discretion of the respective embassy or government authority.
              Consular facilitates the application process only and does not guarantee visa approval.
              For Indian passport holders only in this version.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
