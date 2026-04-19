"use client";
import { useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Circle, Upload, Loader2, Eye } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface ChecklistItem {
  id: string;
  title: string;
  description?: string | null;
  isRequired: boolean;
  acceptedFormats: string[];
  maxFileSizeMb: number;
  status: string;
  rejectionReason?: string | null;
  customerNote?: string | null;
}

interface Props {
  applicationId: string;
  items: ChecklistItem[];
  onRefresh: () => void;
}

export function ChecklistSection({ applicationId, items, onRefresh }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successes, setSuccesses] = useState<Set<string>>(new Set());

  const handleFileChange = useCallback(async (itemId: string, file: File | null) => {
    if (!file) return;
    setErrors((e) => ({ ...e, [itemId]: "" }));
    setUploading(itemId);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("checklistItemId", itemId);

    const res = await fetch(`/api/applications/${applicationId}/documents`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(null);

    if (!data.success) {
      setErrors((e) => ({ ...e, [itemId]: data.error ?? "Upload failed." }));
      return;
    }

    setSuccesses((s) => new Set(s).add(itemId));
    setTimeout(() => {
      setSuccesses((s) => { const n = new Set(s); n.delete(itemId); return n; });
      onRefresh();
    }, 1500);
  }, [applicationId, onRefresh]);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isUploading = uploading === item.id;
        const isSuccess = successes.has(item.id);
        const isApproved = item.status === "APPROVED";
        const isRejected = item.status === "REJECTED";
        const isUploaded = item.status === "UPLOADED" || item.status === "UNDER_REVIEW";
        const canUpload = !isApproved && !isUploading;

        const accept = item.acceptedFormats.map((f) => {
          if (f === "PDF") return "application/pdf";
          if (f === "JPEG" || f === "JPG") return "image/jpeg";
          if (f === "PNG") return "image/png";
          return "";
        }).filter(Boolean).join(",");

        return (
          <div
            key={item.id}
            className={`rounded-xl border p-3.5 transition-colors ${
              isRejected ? "border-red-200 bg-red-50/40" :
              isApproved ? "border-emerald-200 bg-emerald-50/20" :
              "border-slate-100 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left: icon + title */}
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {isApproved ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                   isRejected ? <AlertCircle className="h-4 w-4 text-red-400" /> :
                   <Circle className="h-4 w-4 text-slate-300" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-tight">{item.title}</p>
                  {item.description && <p className="mt-0.5 text-xs text-slate-400 truncate">{item.description}</p>}
                  {isRejected && item.rejectionReason && (
                    <p className="mt-1 text-xs text-red-600">{item.rejectionReason}</p>
                  )}
                  {errors[item.id] && (
                    <p className="mt-1 text-xs text-red-500">{errors[item.id]}</p>
                  )}
                  {isSuccess && (
                    <p className="mt-1 text-xs text-emerald-600">Uploaded successfully</p>
                  )}
                </div>
              </div>

              {/* Right: badge + actions */}
              <div className="flex shrink-0 items-center gap-2">
                {!item.isRequired && <span className="text-[10px] text-slate-400">Optional</span>}
                <StatusBadge status={item.status as "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"} type="checklist" />

                {/* Upload button */}
                {canUpload && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept={accept}
                      onChange={(e) => handleFileChange(item.id, e.target.files?.[0] ?? null)}
                    />
                    <span className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isRejected
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                      {isUploading
                        ? <><Loader2 className="h-3 w-3 animate-spin" /> Uploading</>
                        : <><Upload className="h-3 w-3" /> {isUploaded || isRejected ? "Re-upload" : "Upload"}</>
                      }
                    </span>
                  </label>
                )}

                {/* View indicator for uploaded docs (S3 needed for actual preview) */}
                {(isUploaded || isApproved) && (
                  <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-400 border border-slate-100" title="File preview available after cloud storage is configured">
                    <Eye className="h-3 w-3" /> Uploaded
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
