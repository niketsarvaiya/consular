"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { LogOut, User, FileText, ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/destinations", label: "Destinations", match: (p: string) => p.startsWith("/destinations") },
  { href: "/explore",      label: "Explore",      match: (p: string) => p.startsWith("/explore") },
  { href: "/about",        label: "About",        match: (p: string) => p === "/about" },
  { href: "/contact",      label: "Contact",      match: (p: string) => p === "/contact" },
];

export function CustomerNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = session?.user.name?.split(" ")[0];

  const links = session
    ? [...NAV_LINKS, { href: "/dashboard", label: "My Applications", match: (p: string) => p.startsWith("/dashboard") }]
    : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 px-2.5 transition-shadow group-hover:shadow-md group-hover:shadow-indigo-200">
              <span className="text-xs font-bold tracking-wide text-white">CO</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold tracking-tight text-slate-900">Consular</span>
              <span className="text-[10px] font-medium tracking-wide text-slate-400">Visa concierge</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:text-indigo-600",
                    active ? "text-indigo-600" : "text-slate-500"
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-indigo-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-3 pr-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden max-w-[140px] truncate sm:block">Hi, {firstName}</span>
                  <motion.span
                    animate={{ rotate: menuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl shadow-slate-200/60 origin-top-right"
                    >
                      <div className="border-b border-slate-100 px-4 pb-2.5 pt-1">
                        <p className="text-xs font-semibold text-slate-900">{session.user.name}</p>
                        <p className="text-[11px] text-slate-400">{session.user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        My Applications
                      </Link>
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300 active:scale-95"
                >
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
