import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { decrypt, maskPassportNumber } from "@/lib/utils/crypto";
import { getSignedDownloadUrl } from "@/lib/storage/s3";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CaseStatusActions } from "@/components/admin/CaseStatusActions";
import { CaseDocumentsPanel } from "@/components/admin/CaseDocumentsPanel";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { id: string } }
export const metadata: Metadata = { title: "Case Detail" };

export default async function AdminCaseDetailPage({ params }: Props) {
  await getServerSession(authOptions);

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, fullName: true, email: true, phone: true } },
      passport: true,
      country: true,
      policy: { select: { versionNumber: true, visaCategory: true } },
      checklistItems: {
        orderBy: { sortOrder: "asc" },
        include: {
          documents: {
            where: { isActive: true },
            orderBy: { uploadedAt: "desc" },
            take: 1,
          },
        },
      },
      paymentOrder: true,
      statusHistory: {
        orderBy: { changedAt: "asc" },
        include: { changedBy: { select: { fullName: true } } },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { fullName: true } } },
      },
      assignedTo: { select: { id: true, fullName: true } },
    },
  });

  if (!app) notFound();

  // Mask passport number
  const passportDisplay = app.passport
    ? maskPassportNumber(
        (() => {
          try { return decrypt(app.passport!.passportNumber); }
          catch { return app.passport!.passportNumber; }
        })()
      )
    : null;

  // Generate signed URLs for all documents
  const docsWithUrls = await Promise.all(
    app.checklistItems.map(async (item) => ({
      checklistItemId: item.id,
      checklistTitle: item.title,
      checklistStatus: item.status,
      isRequired: item.isRequired,
      rejectionReason: item.rejectionReason ?? null,
      file: item.documents[0]
        ? {
            documentId: item.documents[0].id,
            fileName: item.documents[0].fileName,
            fileSize: item.documents[0].fileSize,
            mimeType: item.documents[0].mimeType,
            downloadUrl: await getSignedDownloadUrl(item.documents[0].fileKey),
            uploadedAt: item.documents[0].uploadedAt.toISOString(),
          }
        : null,
    }))
  );

  const uploadedCount  = docsWithUrls.filter((d) => d.file).length;
  const approvedCount  = docsWithUrls.filter((d) => d.checklistStatus === "APPROVED").length;
  const rejectedCount  = docsWithUrls.filter((d) => d.checklistStatus === "REJECTED").length;
  const pendingCount   = docsWithUrls.filter((d) => d.file && d.checklistStatus !== "APPROVED" && d.checklistStatus !== "REJECTED").length;

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

          {/* ── Documents panel with viewer ── */}
          <CaseDocumentsPanel
            applicationId={params.id}
            documents={docsWithUrls}
            uploadedCount={uploadedCount}
            approvedCount={approvedCount}
            rejectedCount={rejectedCount}
            pendingCount={pendingCount}
          />

          {/* Notes */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Internal notes</h2>
            {app.notes.filter((n) => n.noteType === "internal").length === 0 && (
              <p className="text-sm text-slate-400">No internal notes yet.</p>
            )}
            <div className="space-y-3">
              {app.notes
                .filter((n) => n.noteType === "internal")
                .map((note) => (
                  <div key={note.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {note.author?.fullName ?? "System"} ·{" "}
                      {new Date(note.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status actions */}
          <CaseStatusActions
            applicationId={params.id}
            currentStatus={app.status}
          />

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
              <p className="text-xs text-slate-400">
                Expires:{" "}
                {new Date(app.passport.expiryDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
          )}

          {app.paymentOrder && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</h3>
              <p className="text-2xl font-semibold text-slate-900">
                ₹{Math.round(app.paymentOrder.amount / 100).toLocaleString("en-IN")}
              </p>
              <p className={`text-xs font-medium ${app.paymentOrder.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                {app.paymentOrder.status}
              </p>
              {app.paymentOrder.paidAt && (
                <p className="text-xs text-slate-400">
                  {new Date(app.paymentOrder.paidAt).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Policy version</h3>
            <p className="text-sm text-slate-700">
              v{app.policyVersionNumber} · {app.policy.visaCategory.replace(/_/g, " ")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status history</h3>
            <div className="space-y-2">
              {app.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <div>
                    <span className="font-medium text-slate-700">{h.toStatus.replace(/_/g, " ")}</span>
                    <span className="ml-2 text-slate-400">
                      {new Date(h.changedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
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
