import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { decrypt, maskPassportNumber } from "@/lib/utils/crypto";
import { getSignedDownloadUrl } from "@/lib/storage/s3";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { CaseActions } from "@/components/admin/CaseActions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { id: string } }
export const metadata: Metadata = { title: "Case Detail" };

export default async function AdminCaseDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, fullName: true, email: true, phone: true } },
      passport: true,
      country: true,
      policy: { select: { versionNumber: true, visaCategory: true } },
      checklistItems: {
        orderBy: { sortOrder: "asc" },
        include: { documents: { where: { isActive: true }, orderBy: { uploadedAt: "desc" }, take: 1 } },
      },
      paymentOrder: true,
      statusHistory: { orderBy: { changedAt: "asc" }, include: { changedBy: { select: { fullName: true } } } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { fullName: true } } } },
      assignedTo: { select: { id: true, fullName: true } },
    },
  });

  if (!app) notFound();

  // Mask passport number
  const passportDisplay = app.passport
    ? maskPassportNumber((() => { try { return decrypt(app.passport.passportNumber); } catch { return app.passport.passportNumber; } })())
    : null;

  // Generate signed URLs for documents
  const docsWithUrls = await Promise.all(
    app.checklistItems.map(async (item) => ({
      ...item,
      documents: await Promise.all(
        item.documents.map(async (doc) => ({ ...doc, downloadUrl: await getSignedDownloadUrl(doc.fileKey) }))
      ),
    }))
  );

  const opsUsers = await prisma.opsUser.findMany({ where: { isActive: true }, select: { id: true, fullName: true } });

  return (
    <div>
      <Link href="/admin/cases" className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to cases
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title={`${app.country.name} – ${app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase()} Visa`}
          description={`Ref: ${app.id.slice(-8).toUpperCase()} · ${app.customer.fullName}`}
        />
        <StatusBadge status={app.status} type="application" className="mt-1" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Documents</h2>
            <div className="space-y-3">
              {docsWithUrls.map((item) => (
                <div key={item.id} className={`rounded-xl border p-4 ${item.status === "APPROVED" ? "border-emerald-200 bg-emerald-50/20" : item.status === "REJECTED" ? "border-red-200 bg-red-50/20" : "border-slate-100"}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      {item.rejectionReason && <p className="text-xs text-red-600 mt-0.5">Reason: {item.rejectionReason}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} type="checklist" />
                      {!item.isRequired && <span className="text-[10px] text-slate-400">Optional</span>}
                    </div>
                  </div>

                  {item.documents[0] && (
                    <div className="mb-3 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">{item.documents[0].fileName}</span>
                      <a href={item.documents[0].downloadUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* CaseActions component handles approve/reject client-side */}
                  <CaseActions
                    applicationId={params.id}
                    checklistItemId={item.id}
                    currentStatus={item.status}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Internal notes</h2>
            {app.notes.filter(n => n.noteType === "internal").length === 0 && (
              <p className="text-sm text-slate-400">No internal notes yet.</p>
            )}
            <div className="space-y-3">
              {app.notes.filter(n => n.noteType === "internal").map((note) => (
                <div key={note.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm text-slate-700">{note.content}</p>
                  <p className="mt-1 text-xs text-slate-400">{note.author?.fullName ?? "System"} · {new Date(note.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</h3>
            <p className="font-medium text-slate-900">{app.customer.fullName}</p>
            <p className="text-sm text-slate-500">{app.customer.email}</p>
            {app.customer.phone && <p className="text-sm text-slate-500">{app.customer.phone}</p>}
          </div>

          {app.passport && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Passport</h3>
              <p className="text-sm text-slate-700">{app.passport.fullName}</p>
              <p className="font-mono text-sm text-slate-500">{passportDisplay}</p>
              <p className="text-xs text-slate-400">Expires: {new Date(app.passport.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
          )}

          {app.paymentOrder && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</h3>
              <p className="text-2xl font-semibold text-slate-900">₹{Math.round(app.paymentOrder.amount / 100).toLocaleString("en-IN")}</p>
              <p className={`text-xs font-medium ${app.paymentOrder.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>{app.paymentOrder.status}</p>
              {app.paymentOrder.paidAt && <p className="text-xs text-slate-400">{new Date(app.paymentOrder.paidAt).toLocaleDateString("en-IN")}</p>}
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Policy version</h3>
            <p className="text-sm text-slate-700">v{app.policyVersionNumber} · {app.policy.visaCategory.replace(/_/g, " ")}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status history</h3>
            <div className="space-y-2">
              {app.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <div>
                    <span className="font-medium text-slate-700">{h.toStatus.replace(/_/g, " ")}</span>
                    <span className="ml-2 text-slate-400">{new Date(h.changedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    {h.changedBy && <span className="ml-1 text-slate-400">by {h.changedBy.fullName}</span>}
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
