import { getAuditLogs } from "@/lib/services/audit.service";
import { PageHeader } from "@/components/shared/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const { items, total } = await getAuditLogs({ page: 1, pageSize: 50 });

  return (
    <div>
      <PageHeader title="Audit Log" description={`${total} total entries`} />

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Resource</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Resource ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-slate-700">{log.actor?.fullName ?? log.actorEmail ?? "System"}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{log.actorType}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">{log.action.replace(/_/g, " ")}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 capitalize">{log.resourceType.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{log.resourceId.slice(-10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="py-16 text-center text-sm text-slate-400">No audit entries yet.</div>}
      </div>
    </div>
  );
}
