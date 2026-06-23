import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TravelProfile } from "@/components/customer/TravelProfile";
import type { PlannedTrip } from "@/components/customer/ProfileMap";
import { EXPLORE_COUNTRIES } from "@/lib/explore-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Profile & Trips" };

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const VISA_TYPE_COLORS: Record<string, string> = {
  TOURIST: "bg-sky-50 text-sky-700 ring-sky-100",
  BUSINESS: "bg-amber-50 text-amber-700 ring-amber-100",
  STUDENT: "bg-violet-50 text-violet-700 ring-violet-100",
  TRANSIT: "bg-slate-100 text-slate-600 ring-slate-200",
};

// ISO-2 → { isoNumeric, flag } lookup for placing planned-trip markers
const ISO2_LOOKUP: Record<string, { numeric: string; flag: string; name: string }> =
  Object.fromEntries(
    EXPLORE_COUNTRIES.map((c) => [c.iso2, { numeric: c.isoNumeric, flag: c.flag, name: c.name }])
  );

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "customer") redirect("/auth/login");

  const [customer, applications] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.user.id },
      select: { visitedCountries: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { customerId: session.user.id },
      include: {
        country: { select: { name: true, flagUrl: true, code: true } },
        checklistItems: { select: { isRequired: true, status: true } },
        paymentOrder: { select: { status: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const initials = (session.user.name ?? "T")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const visited = customer?.visitedCountries ?? [];

  // Planned trips → markers (dedupe by country)
  const seen = new Set<string>();
  const planned: PlannedTrip[] = [];
  for (const app of applications) {
    const lk = ISO2_LOOKUP[app.country.code];
    if (!lk || seen.has(lk.numeric)) continue;
    seen.add(lk.numeric);
    planned.push({
      geoId: lk.numeric,
      name: app.country.name,
      flag: lk.flag,
      status: app.status,
    });
  }

  const inProgress = applications.filter((a) => a.status !== "CLOSED").length;

  const memberSince = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* ── Header strip ── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-base font-bold text-white shadow-md shadow-indigo-200">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-500">{getGreeting()},</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{firstName}! ✨</h1>
              <p className="text-[11px] text-slate-400">Traveller since {memberSince}</p>
            </div>
          </div>
          <Link
            href="/destinations"
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Plan a new trip</span>
            <span className="sm:hidden">New trip</span>
          </Link>
        </div>

        {/* ── Two-column: map left · applications right ── */}
        <div className="grid gap-6 lg:grid-cols-12">

          {/* LEFT — travel map + visited manager */}
          <div className="lg:col-span-7">
            <TravelProfile initialVisited={visited} planned={planned} inProgress={inProgress} />
          </div>

          {/* RIGHT — applications */}
          <div className="lg:col-span-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
              Your applications
            </h2>

            {applications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-14 text-center">
                <div className="text-4xl">🌍</div>
                <h3 className="mt-4 text-base font-bold text-slate-800">Where would you like to go?</h3>
                <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
                  Pick a destination and we&apos;ll build your personalised document checklist.
                </p>
                <Link
                  href="/destinations"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700"
                >
                  Browse destinations <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const requiredItems = app.checklistItems.filter((i) => i.isRequired);
                  const approvedRequired = requiredItems.filter((i) => i.status === "APPROVED").length;
                  const progressPct =
                    requiredItems.length > 0 ? Math.round((approvedRequired / requiredItems.length) * 100) : 0;

                  const visaLabel = app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase();
                  const visaColorClass =
                    VISA_TYPE_COLORS[app.visaType] ?? "bg-slate-100 text-slate-600 ring-slate-200";

                  return (
                    <Link
                      key={app.id}
                      href={`/dashboard/application/${app.id}`}
                      className="group block rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          {app.country.flagUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.country.flagUrl}
                              alt={app.country.name}
                              className="h-10 w-[58px] rounded-lg object-cover shadow-sm"
                            />
                          ) : (
                            <div className="flex h-10 w-[58px] items-center justify-center rounded-lg bg-slate-100 text-2xl">
                              🌐
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-900">{app.country.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${visaColorClass}`}>
                                {visaLabel}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">#{app.id.slice(-8).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <StatusBadge status={app.status} type="application" />
                        {requiredItems.length > 0 && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {approvedRequired}/{requiredItems.length} docs
                          </span>
                        )}
                      </div>

                      {requiredItems.length > 0 && (
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${progressPct}%`,
                              background:
                                progressPct === 100
                                  ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                                  : "linear-gradient(90deg, #6366f1, #f59e0b)",
                            }}
                          />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
