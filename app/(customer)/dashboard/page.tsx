import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">{getGreeting()}</p>
          <h1 className="mt-0.5 text-2xl font-bold text-slate-900">{firstName}&apos;s Applications</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage your visa applications</p>
        </div>
        <Link
          href="/destinations"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New application
        </Link>
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
          <div className="text-5xl">✈️</div>
          <h3 className="mt-4 text-base font-semibold text-slate-800">No applications yet</h3>
          <p className="mt-1.5 text-sm text-slate-500">
            Choose a destination and we&apos;ll generate your document checklist.
          </p>
          <Link
            href="/destinations"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
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

            const visaLabel =
              app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase();
            const visaColorClass =
              VISA_TYPE_COLORS[app.visaType] ?? "bg-slate-100 text-slate-600 ring-slate-200";

            return (
              <Link
                key={app.id}
                href={`/dashboard/application/${app.id}`}
                className="group block rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Flag + info */}
                  <div className="flex items-center gap-4">
                    {app.country.flagUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={app.country.flagUrl}
                        alt={app.country.name}
                        className="h-10 w-14 rounded-md object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded-md bg-slate-100 text-2xl">
                        🌐
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{app.country.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${visaColorClass}`}
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
                  <div className="mt-5">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                      <span>Document progress</span>
                      <span className="font-medium">
                        {approvedRequired}/{requiredItems.length} required approved
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
