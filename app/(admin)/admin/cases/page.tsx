import { getCases } from "@/lib/services/application.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MaskedText } from "@/components/shared/MaskedText";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import type { CaseFilters } from "@/types";

interface Props { searchParams: CaseFilters }

export default async function AdminCasesPage({ searchParams }: Props) {
  const result = await getCases({
    ...searchParams,
    page: searchParams.page ?? 1,
    pageSize: 20,
  });

  return (
    <div>
      <PageHeader title="Cases" description={`${result.total} total applications`} />

      <div className="mt-6 flex flex-wrap gap-3">
        {["ALL", "DOCS_PENDING", "DOCS_UNDER_REVIEW", "PAYMENT_PENDING", "PAYMENT_RECEIVED", "FILED", "APPROVED"].map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/admin/cases" : `/admin/cases?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${(s === "ALL" && !searchParams.status) || searchParams.status === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {s === "ALL" ? "All cases" : s.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Ref</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {result.items.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{app.id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{app.customer.fullName}</p>
                  <p className="text-xs text-slate-400">{app.customer.email}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {app.country.flagUrl && <img src={app.country.flagUrl} alt="" className="h-4 w-6 rounded object-cover" />}
                    <span className="text-slate-700">{app.country.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 capitalize">{app.visaType.toLowerCase()}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={app.status} type="application" /></td>
                <td className="px-4 py-3 text-xs text-slate-500">{app.assignedTo?.fullName ?? <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/cases/${app.id}`} className="text-slate-400 hover:text-slate-700">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {result.items.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-400">No cases found.</div>
        )}

        {result.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-400">Page {result.page} of {result.totalPages} · {result.total} total</p>
          </div>
        )}
      </div>
    </div>
  );
}
