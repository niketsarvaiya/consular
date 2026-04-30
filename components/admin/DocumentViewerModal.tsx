"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, CheckCircle2, XCircle, FileText, Image as ImageIcon,
  FileVideo, File, ChevronLeft, ChevronRight, AlertCircle, Loader2,
  ZoomIn, ZoomOut, RotateCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentForViewer {
  checklistItemId: string;
  checklistTitle: string;
  checklistStatus: string;
  isRequired: boolean;
  rejectionReason?: string | null;
  file?: {
    documentId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    downloadUrl: string;
    uploadedAt: Date | string;
  } | null;
}

interface DocumentViewerModalProps {
  applicationId: string;
  documents: DocumentForViewer[];
  initialIndex?: number;
  onClose: () => void;
  onReview?: (itemId: string, action: "approve" | "reject", reason?: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileType(mimeType?: string, fileName?: string): "image" | "pdf" | "video" | "other" {
  if (!mimeType && !fileName) return "other";
  const mt = mimeType?.toLowerCase() ?? "";
  const fn = fileName?.toLowerCase() ?? "";
  if (mt.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|tiff|bmp)$/.test(fn)) return "image";
  if (mt === "application/pdf" || fn.endsWith(".pdf")) return "pdf";
  if (mt.startsWith("video/")) return "video";
  return "other";
}

function FileTypeIcon({ mimeType, fileName, className = "h-8 w-8" }: { mimeType?: string; fileName?: string; className?: string }) {
  const type = getFileType(mimeType, fileName);
  if (type === "image") return <ImageIcon className={`${className} text-blue-400`} />;
  if (type === "pdf")   return <FileText className={`${className} text-red-400`} />;
  if (type === "video") return <FileVideo className={`${className} text-purple-400`} />;
  return <File className={`${className} text-slate-400`} />;
}

function statusColor(status: string) {
  if (status === "APPROVED") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (status === "REJECTED") return "text-red-600 bg-red-50 border-red-200";
  if (status === "UPLOADED" || status === "UNDER_REVIEW") return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-slate-500 bg-slate-50 border-slate-200";
}

// ─── Preview Area ─────────────────────────────────────────────────────────────

function PreviewArea({ file }: { file: NonNullable<DocumentForViewer["file"]> }) {
  const type = getFileType(file.mimeType, file.fileName);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loaded, setLoaded] = useState(false);

  if (type === "image") {
    return (
      <div className="relative h-full flex flex-col">
        {/* Image controls */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-black/5 border-b border-slate-100">
          <span className="text-xs text-slate-500 truncate">{file.fileName}</span>
          <div className="flex gap-1">
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
              <RotateCw className="h-4 w-4" />
            </button>
            {!loaded && <Loader2 className="h-4 w-4 text-slate-400 animate-spin mt-1.5" />}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-900 flex items-center justify-center p-4">
          <img
            src={file.downloadUrl}
            alt={file.fileName}
            onLoad={() => setLoaded(true)}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            className="rounded shadow-xl"
          />
        </div>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div className="relative h-full flex flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-black/5 border-b border-slate-100">
          <span className="text-xs text-slate-500 truncate">{file.fileName}</span>
          <span className="text-xs text-slate-400">PDF · {formatBytes(file.fileSize)}</span>
        </div>
        <iframe
          src={`${file.downloadUrl}#toolbar=1`}
          className="flex-1 w-full bg-slate-100"
          title={file.fileName}
        />
      </div>
    );
  }

  // Unsupported preview — show download prompt
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50">
      <FileTypeIcon mimeType={file.mimeType} fileName={file.fileName} className="h-16 w-16" />
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">{file.fileName}</p>
        <p className="text-xs text-slate-400 mt-1">{file.mimeType} · {formatBytes(file.fileSize)}</p>
      </div>
      <a
        href={file.downloadUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        <Download className="h-4 w-4" />
        Download to preview
      </a>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function DocumentViewerModal({
  applicationId,
  documents,
  initialIndex = 0,
  onClose,
  onReview,
}: DocumentViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, documents.length - 1))
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const current = documents[currentIndex];
  const totalWithFiles = documents.filter((d) => d.file).length;

  // Keyboard navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex((i) => i - 1);
      if (e.key === "ArrowRight" && currentIndex < documents.length - 1) setCurrentIndex((i) => i + 1);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [currentIndex, documents.length, onClose]);

  const handleReview = async (action: "approve" | "reject") => {
    if (action === "reject" && !showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/cases/${applicationId}/documents/${current.checklistItemId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: action === "reject" ? rejectionReason : undefined }),
      });
      if (res.ok) {
        setLocalStatuses((prev) => ({
          ...prev,
          [current.checklistItemId]: action === "approve" ? "APPROVED" : "REJECTED",
        }));
        setShowRejectInput(false);
        setRejectionReason("");
        onReview?.(current.checklistItemId, action, rejectionReason);
        // Auto-advance to next pending document
        if (action === "approve") {
          const nextPending = documents.findIndex(
            (d, i) => i > currentIndex && d.file && localStatuses[d.checklistItemId] !== "APPROVED" && d.checklistStatus !== "APPROVED"
          );
          if (nextPending !== -1) setCurrentIndex(nextPending);
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const effectiveStatus = localStatuses[current.checklistItemId] ?? current.checklistStatus;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="relative bg-white rounded-2xl shadow-2xl flex w-full max-w-6xl h-[88vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Left panel: document list ── */}
          <div className="w-64 shrink-0 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-700">
                Documents <span className="text-slate-400">({documents.length})</span>
              </p>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {documents.map((doc, idx) => {
                const status = localStatuses[doc.checklistItemId] ?? doc.checklistStatus;
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={doc.checklistItemId}
                    onClick={() => { setCurrentIndex(idx); setShowRejectInput(false); }}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${isActive ? "bg-white border-r-2 border-indigo-500" : "hover:bg-white/60"}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {doc.file ? (
                        <FileTypeIcon mimeType={doc.file.mimeType} fileName={doc.file.fileName} className="h-5 w-5" />
                      ) : (
                        <File className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium leading-tight ${isActive ? "text-indigo-700" : "text-slate-700"} truncate`}>
                        {doc.checklistTitle}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${statusColor(status)}`}>
                          {status.replace(/_/g, " ")}
                        </span>
                        {!doc.isRequired && <span className="text-[10px] text-slate-400">opt</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                {documents.filter((d) => (localStatuses[d.checklistItemId] ?? d.checklistStatus) === "APPROVED").length} approved ·{" "}
                {documents.filter((d) => !d.file).length} awaiting upload
              </p>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{current.checklistTitle}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(effectiveStatus)}`}>
                      {effectiveStatus.replace(/_/g, " ")}
                    </span>
                    {!current.isRequired && <span className="text-xs text-slate-400">Optional</span>}
                    {current.file && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{current.file.fileName}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">{formatBytes(current.file.fileSize)}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-400">
                          {new Date(current.file.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Download */}
                {current.file && (
                  <a
                    href={current.file.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                )}

                {/* Navigation */}
                <button
                  onClick={() => { setCurrentIndex((i) => Math.max(0, i - 1)); setShowRejectInput(false); }}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-slate-400 min-w-[3rem] text-center">
                  {currentIndex + 1} / {documents.length}
                </span>
                <button
                  onClick={() => { setCurrentIndex((i) => Math.min(documents.length - 1, i + 1)); setShowRejectInput(false); }}
                  disabled={currentIndex === documents.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button onClick={onClose} className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 min-h-0">
              {current.file ? (
                <PreviewArea file={current.file} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50">
                  <File className="h-12 w-12 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No file uploaded yet</p>
                  <p className="text-xs text-slate-400">Waiting for the customer to upload this document</p>
                </div>
              )}
            </div>

            {/* Review actions footer */}
            {current.file && effectiveStatus !== "APPROVED" && effectiveStatus !== "REJECTED" && (
              <div className="border-t border-slate-100 px-6 py-4 bg-white shrink-0">
                {showRejectInput ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Rejection reason <span className="text-red-500">*</span>
                      </label>
                      <input
                        autoFocus
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && rejectionReason && handleReview("reject")}
                        placeholder="e.g. Image is blurry, please re-upload"
                        className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-red-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview("reject")}
                        disabled={!rejectionReason || processing}
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        Confirm rejection
                      </button>
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectionReason(""); }}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Review this document for compliance</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview("reject")}
                        disabled={processing}
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleReview("approve")}
                        disabled={processing}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Already reviewed footer */}
            {current.file && (effectiveStatus === "APPROVED" || effectiveStatus === "REJECTED") && (
              <div className={`border-t px-6 py-3 flex items-center gap-2 shrink-0 ${effectiveStatus === "APPROVED" ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}>
                {effectiveStatus === "APPROVED" ? (
                  <><CheckCircle2 className="h-4 w-4 text-emerald-600" /><p className="text-sm font-medium text-emerald-700">Document approved</p></>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-700">Document rejected</p>
                      {current.rejectionReason && <p className="text-xs text-red-500">{current.rejectionReason}</p>}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
