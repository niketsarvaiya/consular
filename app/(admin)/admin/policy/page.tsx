import { getPolicies } from "@/lib/services/policy.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPolicyPage() {
  const policies = await getPolicies();

  const needsReview = policies.filter((p) => p.status === "NEEDS_REVIEW");
  const active = policies.filter((p) => p.status === "ACTIVE");
  const drafts = policies.filter((p) => p.status === "DRAFT");

  return (
    <div>
      <PageHeader title="Policy Engine" description="Manage and refresh country visa policies" />

      {needsReview.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">{needsReview.length} {needsReview.length === 1 ? "policy requires" : "policies require"} review</p>
            <p className="mt-0.5 text-xs text-amber-700">An automated refresh detected changes. Review and approve before they go live.</p>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Country</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Visa Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Version</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Last Refreshed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {policies.map((policy) => (
              <tr key={policy.id} className={`hover:bg-slate-50 ${policy.status === "NEEDS_REVIEW" ? "bg-amber-50/40" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {policy.country.flagUrl && <img src={policy.country.flagUrl} alt="" className="h-4 w-6 rounded object-cover" />}
                    <span className="font-medium text-slate-900">{policy.country.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">{policy.visaType.toLowerCase()}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{policy.visaCategory.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">v{policy.versionNumber}</td>
                <td className="px-4 py-3"><StatusBadge status={policy.status} type="policy" /></td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {policy.lastRefreshedAt ? new Date(policy.lastRefreshedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/policy/${policy.country.code.toLowerCase()}/${policy.visaType.toLowerCase()}`} className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900">
                    Manage <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
