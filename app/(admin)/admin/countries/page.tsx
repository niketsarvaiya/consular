import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { CountryManager } from "@/components/admin/CountryManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Country Manager" };

export default async function AdminCountriesPage() {
  const countries = await prisma.country.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { policies: true, applications: true } },
      policies: {
        select: { id: true, visaType: true, status: true, lastRefreshedAt: true },
        orderBy: { visaType: "asc" },
      },
    },
  });

  // Serialize for client component
  const serialised = countries.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    flagUrl: c.flagUrl ?? null,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    policyCount: c._count.policies,
    applicationCount: c._count.applications,
    policies: c.policies.map((p) => ({
      id: p.id,
      visaType: p.visaType,
      status: p.status,
      lastRefreshedAt: p.lastRefreshedAt?.toISOString() ?? null,
    })),
  }));

  const stats = {
    total: countries.length,
    active: countries.filter((c) => c.isActive).length,
    withPolicies: countries.filter((c) => c._count.policies > 0).length,
    needsReview: countries.flatMap((c) => c.policies).filter((p) => p.status === "NEEDS_REVIEW").length,
  };

  return (
    <div>
      <PageHeader
        title="Country Manager"
        description="Activate or deactivate countries, manage visibility on the explore map"
      />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Total countries", value: stats.total, color: "text-slate-900" },
          { label: "Active", value: stats.active, color: "text-emerald-700" },
          { label: "Have policies", value: stats.withPolicies, color: "text-indigo-700" },
          { label: "Needs review", value: stats.needsReview, color: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">{s.label}</p>
            <p className={`mt-1 text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <CountryManager countries={serialised} />
    </div>
  );
}
