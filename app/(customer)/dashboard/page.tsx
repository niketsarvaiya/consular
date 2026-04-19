import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Applications" };

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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "customer") redirect("/auth/login");

  const applications = await prisma.application.findMany({
    where: { customerId: session.user.id },
    include: {
      country: { select: { name: true, flagUrl: true, code: true } },
      checklistItems: { select: { isRequired: true, status: true } },
      paymentOrder: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 to-white">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-12 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-500">
              {getGreeting()},
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {firstName}! ✨
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Here&apos;s where all your visa applications live.
            </p>
          </div>
          <Link
            href="/destinations"
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300"
          >
            <MapPin className="h-4 w-4" />
            Plan a new trip
          </Link>
        </div>

        {/* ── Empty state ── */}
        {applications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/40 px-8 py-24 text-center">
            <div className="text-5xl">🌍</div>
            <h3 className="mt-5 text-xl font-bold text-slate-800">
              Where would you like to go?
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              Pick a destination and we&apos;ll build your personalised
              document checklist — so you always know exactly what to prepare.
            </p>
            <Link
              href="/destinations"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700"
            >
              Browse destinations <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-slate-400">
              Free to start · No card required
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {applications.map((app) => {
              const requiredItems = app.checklistItems.filter((i) => i.isRequired);
              const approvedRequired = requiredItems.filter(
                (i) => i.status === "APPROVED"
              ).length;
              const progressPct =
                requiredItems.length > 0
                  ? Math.round((approvedRequired / requiredItems.length) * 100)
                  : 0;

              const visaLabel =
                app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase();
              const visaColorClass =
                VISA_TYPE_COLORS[app.visaType] ??
                "bg-slate-100 text-slate-600 ring-slate-200";

              return (
                <Link
                  key={app.id}
                  href={`/dashboard/application/${app.id}`}
                  className="group block rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Flag + info */}
                    <div className="flex items-center gap-5">
                      {/* Flag — prominent */}
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
                        <p className="text-base font-bold text-slate-900">
                          {app.country.name}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${visaColorClass}`}
                          >
                            {visaLabel} Visa
                          </span>
                          <span className="font-mono text-xs text-slate-400">
                            #{app.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status + arrow */}
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={app.status} type="application" />
                      <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {requiredItems.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">
                          Document progress
                        </span>
                        <span className="font-semibold text-slate-700">
                          {approvedRequired}/{requiredItems.length} approved
                        </span>
                      </div>
                      {/* Track */}
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        {/* Amber lead, indigo fill */}
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
                      <p className="mt-1.5 text-right text-[11px] text-slate-400">
                        {progressPct}% complete
                      </p>
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
