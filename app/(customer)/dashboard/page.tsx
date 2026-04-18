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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Applications</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage your visa applications</p>
        </div>
        <Link href="/destinations" className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" /> New application
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-slate-500">No applications yet.</p>
          <Link href="/destinations" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:underline">
            Start your first application <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const requiredItems = app.checklistItems.filter((i) => i.isRequired);
            const approvedRequired = requiredItems.filter((i) => i.status === "APPROVED").length;
            const progressPct = requiredItems.length > 0 ? Math.round((approvedRequired / requiredItems.length) * 100) : 0;

            return (
              <Link key={app.id} href={`/dashboard/application/${app.id}`} className="group block rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {app.country.flagUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={app.country.flagUrl} alt="" className="h-8 w-12 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{app.country.name} – {app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase()} Visa</p>
                      <p className="text-xs text-slate-400">Ref: {app.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} type="application" />
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-600" />
                  </div>
                </div>

                {requiredItems.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Document progress</span>
                      <span>{approvedRequired}/{requiredItems.length} required approved</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
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
