"use client";

import { useState } from "react";
import {
  FileText, Eye, CheckCircle2, XCircle, Clock, Upload,
  AlertCircle, ChevronRight,
} from "lucide-react";
import { DocumentViewerModal, type DocumentForViewer } from "./DocumentViewerModal";

interface CaseDocumentsPanelProps {
  applicationId: string;
  documents: DocumentForViewer[];
  uploadedCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
}

function statusMeta(status: string) {
  if (status === "APPROVED")     return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", label: "Approved" };
  if (status === "REJECTED")     return { icon: XCircle,      color: "text-red-500",     bg: "bg-red-50 border-red-100",         label: "Rejected" };
  if (status === "UNDER_REVIEW") return { icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50 border-amber-100",     label: "Under review" };
  if (status === "UPLOADED")     return { icon: Clock,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-100",       label: "Uploaded" };
  return { icon: Upload, color: "text-slate-400", bg: "bg-slate-50 border-slate-100", label: "Pending upload" };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function CaseDocumentsPanel({
  applicationId,
  documents: initialDocs,
  uploadedCount,
  approvedCount,
  rejectedCount,
  pendingCount,
}: CaseDocumentsPanelProps) {
  const [docs, setDocs]               = useState<DocumentForViewer[]>(initialDocs);
  const [modalOpen, setModalOpen]     = useState(false);
  const [startIndex, setStartIndex]   = useState(0);

  const openAt = (index: number) => {
    setStartIndex(index);
    setModalOpen(true);
  };

  // Optimistically update status when reviewed inside modal
  const handleReview = (itemId: string, action: "approve" | "reject", reason?: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.checklistItemId === itemId
          ? { ...d, checklistStatus: action === "approve" ? "APPROVED" : "REJECTED", rejectionReason: reason ?? null }
          : d
      )
    );
  };

  const totalRequired = docs.filter((d) => d.isRequired).length;
  const approvedRequired = docs.filter((d) => d.isRequired && d.checklistStatus === "APPROVED").length;
  const progress = totalRequired > 0 ? Math.round((approvedRequired / totalRequired) * 100) : 0;

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Header with progress */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Documents
              <span className="ml-2 text-slate-400 font-normal">({docs.length})</span>
            </h2>
            {docs.some((d) => d.file && d.checklistStatus !== "APPROVED" && d.checklistStatus !== "REJECTED") && (
              <button
                onClick={() => {
                  const firstPending = docs.findIndex(
                    (d) => d.file && d.checklistStatus !== "APPROVED" && d.checklistStatus !== "REJECTED"
                  );
                  openAt(Math.max(0, firstPending));
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                Review all
              </button>
            )}
          </div>

          {/* Summary pills */}
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { label: "Uploaded",  count: uploadedCount,  color: "bg-slate-100 text-slate-600" },
              { label: "Approved",  count: approvedCount,  color: "bg-emerald-100 text-emerald-700" },
              { label: "Rejected",  count: rejectedCount,  color: "bg-red-100 text-red-700" },
              { label: "Pending review", count: pendingCount, color: "bg-amber-100 text-amber-700" },
            ].map((s) => (
              <span key={s.label} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                {s.count} {s.label}
              </span>
            ))}
          </div>

          {/* Progress bar for required docs */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Required documents approved</span>
              <span>{approvedRequired}/{totalRequired}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Document rows */}
        <div className="divide-y divide-slate-50">
          {docs.map((doc, idx) => {
            const meta = statusMeta(doc.checklistStatus);
            const Icon = meta.icon;
            return (
              <div
                key={doc.checklistItemId}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group border-l-2 ${
                  doc.checklistStatus === "APPROVED" ? "border-l-emerald-400" :
                  doc.checklistStatus === "REJECTED" ? "border-l-red-400" :
                  doc.file ? "border-l-amber-300" : "border-l-transparent"
                }`}
                onClick={() => openAt(idx)}
              >
                {/* Icon */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.bg}`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.checklistTitle}</p>
                    {!doc.isRequired && (
                      <span className="shrink-0 text-[10px] text-slate-400 border border-slate-200 rounded px-1">opt</span>
                    )}
                  </div>
                  {doc.file ? (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {doc.file.fileName}
                      <span className="mx-1">·</span>
                      {formatBytes(doc.file.fileSize)}
                      <span className="mx-1">·</span>
                      {new Date(doc.file.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5">Waiting for upload</p>
                  )}
                  {doc.rejectionReason && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {doc.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium border ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </span>
                  {doc.file && (
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {docs.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12">
            <FileText className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">No documents in checklist</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <DocumentViewerModal
          applicationId={applicationId}
          documents={docs}
          initialIndex={startIndex}
          onClose={() => setModalOpen(false)}
          onReview={handleReview}
        />
      )}
    </>
  );
}
