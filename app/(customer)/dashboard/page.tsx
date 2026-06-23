import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, MapPin, Plane, Globe2, FileCheck2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProfileMap, type PlannedTrip } from "@/components/customer/ProfileMap";
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

  return (
    <div className="bg-slate-50/60 min-h-screen">
      {/* ── Map cover ── */}
      <section className="relative h-[300px] w-full overflow-hidden sm:h-[380px]">
        <ProfileMap initialVisited={visited} planned={planned} editable />

        {/* gradient fade into page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-slate-50/60" />

        {/* greeting overlay */}
        <div className="pointer-events-none absolute left-0 top-0 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">{getGreeting()},</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl">
            {firstName}&apos;s travel map
          </h1>
          <p className="mt-2 max-w-md text-sm text-slate-300">
            Tap any country to mark it visited. Your planned trips glow ✈
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* ── Profile + stats card (overlaps the map) ── */}
        <div className="relative -mt-12 mb-10 rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-md shadow-indigo-200">
                {initials}
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{session.user.name}</p>
                <p className="text-xs text-slate-400">
                  Traveller since{" "}
                  {customer?.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Globe2, label: "Visited", value: visited.length, color: "text-emerald-600" },
                { icon: Plane, label: "Planned", value: planned.length, color: "text-indigo-600" },
                { icon: FileCheck2, label: "In progress", value: inProgress, color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                  <s.icon className={`mx-auto mb-1 h-4 w-4 ${s.color}`} />
                  <p className="text-xl font-black text-slate-900">{s.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Applications ── */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Your applications</h2>
          <Link
            href="/destinations"
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300"
          >
            <MapPin className="h-4 w-4" />
            Plan a new trip
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="mb-16 rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/40 px-8 py-20 text-center">
            <div className="text-5xl">🌍</div>
            <h3 className="mt-5 text-xl font-bold text-slate-800">Where would you like to go?</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              Pick a destination and we&apos;ll build your personalised document checklist — so you always know exactly what to prepare.
            </p>
            <Link
              href="/destinations"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700"
            >
              Browse destinations <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-slate-400">Free to start · No card required</p>
          </div>
        ) : (
          <div className="mb-16 space-y-5">
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
                  className="group block rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {app.country.flagUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={app.country.flagUrl}
                          alt={app.country.name}
                          className="h-12 w-[68px] rounded-xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-12 w-[68px] items-center justify-center rounded-xl bg-slate-100 text-3xl">
                          🌐
                        </div>
                      )}
                      <div>
                        <p className="text-base font-bold text-slate-900">{app.country.name}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${visaColorClass}`}>
                            {visaLabel} Visa
                          </span>
                          <span className="font-mono text-xs text-slate-400">#{app.id.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={app.status} type="application" />
                      <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500" />
                    </div>
                  </div>

                  {requiredItems.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">Document progress</span>
                        <span className="font-semibold text-slate-700">
                          {approvedRequired}/{requiredItems.length} approved
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${progressPct}%`,
                            background:
                              progressPct === 100
                                ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                                : "linear-gradient(90deg, #6366f1, #f59e0b)",
                          }}
                        />
                      </div>
                      <p className="mt-1.5 text-right text-[11px] text-slate-400">{progressPct}% complete</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
