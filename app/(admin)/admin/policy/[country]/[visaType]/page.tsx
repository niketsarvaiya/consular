import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { PolicyRefreshButton } from "@/components/admin/PolicyRefreshButton";
import { PolicyEditor } from "@/components/admin/PolicyEditor";
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

  // Serialise policy for client component (dates → strings)
  const policyForEditor = {
    visaCategory: policy.visaCategory,
    status: policy.status,
    processingTimeMin: policy.processingTimeMin ?? 0,
    processingTimeMax: policy.processingTimeMax ?? 0,
    processingNotes: policy.processingNotes,
    requiredDocuments: (policy.requiredDocuments as { key: string; title: string; description?: string; acceptedFormats?: string[]; maxFileSizeMb?: number }[]) ?? [],
    optionalDocuments: (policy.optionalDocuments as { key: string; title: string; description?: string; acceptedFormats?: string[]; maxFileSizeMb?: number }[]) ?? [],
    feeDetails: (policy.feeDetails as Record<string, unknown>) ?? null,
    appointmentNotes: policy.appointmentNotes,
    biometricsNotes: policy.biometricsNotes,
    vacNotes: policy.vacNotes,
    embassyLinks: (policy.embassyLinks as { label: string; url: string }[]) ?? [],
    eligibilityRules: (policy.eligibilityRules as Record<string, unknown>) ?? null,
  };

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
              <p className="text-sm font-semibold text-amber-800">Auto-refresh detected changes — requires your review</p>
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
          {pendingSnapshot.diff && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-amber-700">View change summary</summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-amber-100 p-3 text-[10px] text-amber-900">{JSON.stringify(pendingSnapshot.diff, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      {/* ── Full Policy Editor ── */}
      <PolicyEditor
        policyId={policy.id}
        countryCode={country.code}
        countryName={country.name}
        visaType={params.visaType}
        initialData={policyForEditor}
      />

      {/* Version history & metadata sidebar */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Metadata</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Version</span><span className="font-mono text-slate-700">v{policy.versionNumber}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Last refreshed</span><span className="text-slate-700">{policy.lastRefreshedAt ? new Date(policy.lastRefreshedAt).toLocaleDateString("en-IN") : "Never"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Last approved</span><span className="text-slate-700">{policy.lastApprovedAt ? new Date(policy.lastApprovedAt).toLocaleDateString("en-IN") : "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Approved by</span><span className="text-slate-700">{policy.approvedBy?.fullName ?? "—"}</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
            {snapshots.length === 0 && <p className="text-xs text-slate-400">No version history yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
