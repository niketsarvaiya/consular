import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react";
import { PolicyRefreshButton } from "@/components/admin/PolicyRefreshButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { country: string; visaType: string } }
export const metadata: Metadata = { title: "Policy Editor" };

export default async function AdminPolicyDetailPage({ params }: Props) {
  const country = await prisma.country.findFirst({ where: { code: params.country.toUpperCase() } });
  if (!country) notFound();

  const policy = await prisma.visaPolicy.findFirst({
    where: { countryId: country.id, visaType: params.visaType.toUpperCase() as "TOURIST" | "BUSINESS", nationality: "IND" },
    include: { sources: true, approvedBy: { select: { fullName: true } } },
  });
  if (!policy) notFound();

  const snapshots = await prisma.policySnapshot.findMany({
    where: { policyId: policy.id },
    orderBy: { versionNumber: "desc" },
    take: 10,
  });

  const pendingSnapshot = snapshots.find((s) => s.status === "pending_review");

  const feeDetails = policy.feeDetails as { governmentFeeINR: number; serviceFeeINR: number; taxes?: number; notes?: string } | null;
  const reqDocs = (policy.requiredDocuments as { key: string; title: string }[]) ?? [];
  const optDocs = (policy.optionalDocuments as { key: string; title: string }[]) ?? [];
  const embassyLinks = (policy.embassyLinks as { label: string; url: string }[]) ?? [];

  return (
    <div>
      <Link href="/admin/policy" className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to policies
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title={`${country.name} – ${params.visaType.charAt(0).toUpperCase() + params.visaType.slice(1)} Visa`}
          description={`v${policy.versionNumber} · ${policy.visaCategory.replace(/_/g, " ")} · For Indian passport holders`}
        />
        <div className="flex items-center gap-2">
          <StatusBadge status={policy.status} type="policy" />
          <PolicyRefreshButton policyId={policy.id} countryName={country.name} />
        </div>
      </div>

      {/* Pending review banner */}
      {pendingSnapshot && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-800">Changes detected — requires your review</p>
              <p className="mt-1 text-xs text-amber-700">
                Change types: {(pendingSnapshot.changeTypes ?? []).join(", ")}
              </p>
              <p className="mt-0.5 text-xs text-amber-600">
                Detected {new Date(pendingSnapshot.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex gap-2">
              <form action={`/api/admin/policies/${policy.id}/approve`} method="POST" className="contents">
                <input type="hidden" name="snapshotId" value={pendingSnapshot.id} />
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
              </form>
              <form action={`/api/admin/policies/${policy.id}/reject`} method="POST" className="contents">
                <input type="hidden" name="snapshotId" value={pendingSnapshot.id} />
                <button type="submit" className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </form>
            </div>
          </div>

          {/* Show diff summary */}
          {pendingSnapshot.diff && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-amber-700">View change summary</summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-amber-100 p-3 text-[10px] text-amber-900">{JSON.stringify(pendingSnapshot.diff, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Fees */}
          {feeDetails && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Fee details</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Government fee</p><p className="mt-1 font-semibold text-slate-900">₹{feeDetails.governmentFeeINR.toLocaleString("en-IN")}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Service fee</p><p className="mt-1 font-semibold text-slate-900">₹{feeDetails.serviceFeeINR.toLocaleString("en-IN")}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Processing time</p><p className="mt-1 font-semibold text-slate-900">{policy.processingTimeMin}–{policy.processingTimeMax} days</p></div>
              </div>
              {feeDetails.notes && <p className="mt-3 text-xs text-slate-500">{feeDetails.notes}</p>}
            </div>
          )}

          {/* Documents */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Required documents ({reqDocs.length})</h2>
            <div className="space-y-1">
              {reqDocs.map((d) => (
                <div key={d.key} className="flex items-center gap-2 text-sm text-slate-600 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />{d.title}
                </div>
              ))}
            </div>
            {optDocs.length > 0 && (
              <>
                <h3 className="mb-2 mt-4 text-xs font-semibold text-slate-500">Optional documents</h3>
                {optDocs.map((d) => (
                  <div key={d.key} className="flex items-center gap-2 text-sm text-slate-400 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />{d.title}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Notes */}
          {(policy.appointmentNotes || policy.biometricsNotes || policy.vacNotes) && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Process notes</h2>
              {policy.appointmentNotes && <div><p className="text-xs font-medium text-slate-400">Appointment</p><p className="text-sm text-slate-600">{policy.appointmentNotes}</p></div>}
              {policy.biometricsNotes && <div><p className="text-xs font-medium text-slate-400">Biometrics</p><p className="text-sm text-slate-600">{policy.biometricsNotes}</p></div>}
              {policy.vacNotes && <div><p className="text-xs font-medium text-slate-400">VAC / Center</p><p className="text-sm text-slate-600">{policy.vacNotes}</p></div>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Version</span><span className="font-mono text-slate-700">v{policy.versionNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Last refreshed</span><span className="text-slate-700">{policy.lastRefreshedAt ? new Date(policy.lastRefreshedAt).toLocaleDateString("en-IN") : "Never"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Last approved</span><span className="text-slate-700">{policy.lastApprovedAt ? new Date(policy.lastApprovedAt).toLocaleDateString("en-IN") : "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Approved by</span><span className="text-slate-700">{policy.approvedBy?.fullName ?? "—"}</span></div>
            </div>
          </div>

          {embassyLinks.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Official sources</h3>
              <div className="space-y-2">
                {embassyLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Version history</h3>
            <div className="space-y-2">
              {snapshots.map((s) => (
                <div key={s.id} className="flex items-start gap-2 text-xs">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.status === "approved" ? "bg-emerald-500" : s.status === "rejected" ? "bg-red-400" : "bg-amber-400"}`} />
                  <div>
                    <span className="font-medium text-slate-700">v{s.versionNumber}</span>
                    <span className="ml-1.5 text-slate-400">{s.changeSource.replace(/_/g, " ")}</span>
                    <span className="ml-1.5 text-slate-400">{new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
