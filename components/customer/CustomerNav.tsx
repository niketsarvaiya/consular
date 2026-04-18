"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { LogOut, User, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";

export function CustomerNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">Consular</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/destinations" className={cn("text-sm font-medium transition-colors hover:text-slate-900", pathname.startsWith("/destinations") ? "text-slate-900" : "text-slate-500")}>
              Destinations
            </Link>
            {session && (
              <Link href="/dashboard" className={cn("text-sm font-medium transition-colors hover:text-slate-900", pathname.startsWith("/dashboard") ? "text-slate-900" : "text-slate-500")}>
                My Applications
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-3 pr-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block max-w-[120px] truncate">{session.user.name?.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                      <FileText className="h-4 w-4" />My Applications
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <LogOut className="h-4 w-4" />Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
                <Link href="/auth/register" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800">Get started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
