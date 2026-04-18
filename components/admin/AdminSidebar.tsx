"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, FolderOpen, Globe, Users, ClipboardList, LogOut, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/cases", label: "Cases", icon: FolderOpen, exact: false },
  { href: "/admin/policy", label: "Policy Engine", icon: Globe, exact: false },
  { href: "/admin/team", label: "Team", icon: Users, exact: false },
  { href: "/admin/audit", label: "Audit Log", icon: ClipboardList, exact: false },
];

interface AdminSidebarProps { user: { name?: string | null; email?: string | null; role?: string }; }

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900">
          <span className="text-xs font-bold text-white">C</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Consular</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Ops Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn("group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}>
              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 rounded-md bg-slate-50 px-3 py-2">
          <p className="text-xs font-medium text-slate-900 truncate">{user.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          <span className="mt-1 inline-block rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{user.role}</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <LogOut className="h-4 w-4" />Sign out
        </button>
      </div>
    </aside>
  );
}
