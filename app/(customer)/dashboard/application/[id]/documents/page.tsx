"use client";
import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, Check, X, AlertCircle, Loader2, ArrowLeft, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import Link from "next/link";

interface ChecklistItem {
  id: string; title: string; description?: string; isRequired: boolean;
  acceptedFormats: string[]; maxFileSizeMb: number; status: string;
  rejectionReason?: string; customerNote?: string;
}

interface ApplicationData {
  id: string;
  country: { name: string };
  checklistItems: ChecklistItem[];
}

export default function DocumentsPage() {
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [uploading, setUploading] = useState<string | null>(null); // checklistItemId being uploaded
  const [progress, setProgress] = useState<Record<string, number>>({}); // itemId → 0–100
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/applications/${id}`).then((r) => r.json()).then((data) => {
      if (data.success) setApplication(data.data);
    });
  }, [id]);

  const handleDrop = useCallback((acceptedFiles: File[], itemId: string) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError("");
    setUploading(itemId);
    setProgress((p) => ({ ...p, [itemId]: 0 }));

    // XHR (not fetch) so we get real upload-progress events for the progress bar.
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    fd.append("checklistItemId", itemId);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress((p) => ({ ...p, [itemId]: Math.round((e.loaded / e.total) * 100) }));
      }
    };

    xhr.onload = async () => {
      setUploading(null);
      let ok = false;
      try { ok = xhr.status >= 200 && xhr.status < 300 && JSON.parse(xhr.responseText).success; } catch { ok = false; }

      if (!ok) {
        let msg = "Upload failed. Please try again.";
        try { msg = JSON.parse(xhr.responseText).error ?? msg; } catch {}
        setError(typeof msg === "string" ? msg : "Upload failed.");
        setProgress((p) => { const n = { ...p }; delete n[itemId]; return n; });
        return;
      }

      setProgress((p) => ({ ...p, [itemId]: 100 }));
      // Refresh so the item's status flips to "Uploaded"
      const refreshed = await fetch(`/api/applications/${id}`).then((r) => r.json());
      if (refreshed.success) setApplication(refreshed.data);
      setTimeout(() => setProgress((p) => { const n = { ...p }; delete n[itemId]; return n; }), 1200);
    };

    xhr.onerror = () => {
      setUploading(null);
      setError("Network error during upload. Please try again.");
      setProgress((p) => { const n = { ...p }; delete n[itemId]; return n; });
    };

    xhr.open("POST", `/api/applications/${id}/documents`);
    xhr.send(fd);
  }, [id]);

  if (!application) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>;
  }

  const requiredItems = application.checklistItems.filter((i) => i.isRequired);
  const optionalItems = application.checklistItems.filter((i) => !i.isRequired);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href={`/dashboard/application/${id}`} className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to application
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Upload Documents</h1>
        <p className="mt-1 text-sm text-slate-500">{application.country.name} visa application</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      <div className="space-y-6">
        <DocumentSection title="Required Documents" items={requiredItems} onDrop={handleDrop} uploading={uploading} progress={progress} />
        {optionalItems.length > 0 && <DocumentSection title="Optional Documents" items={optionalItems} onDrop={handleDrop} uploading={uploading} progress={progress} optional />}
      </div>
    </div>
  );
}

function DocumentSection({ title, items, onDrop, uploading, progress, optional }: {
  title: string; items: ChecklistItem[];
  onDrop: (files: File[], itemId: string) => void;
  uploading: string | null; progress: Record<string, number>; optional?: boolean;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        {title}
        {optional && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">Optional</span>}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <DocumentItemCard key={item.id} item={item} onDrop={onDrop} uploading={uploading} progress={progress[item.id]} />
        ))}
      </div>
    </div>
  );
}

function DocumentItemCard({ item, onDrop, uploading, progress }: {
  item: ChecklistItem; onDrop: (files: File[], itemId: string) => void;
  uploading: string | null; progress: number | undefined;
}) {
  const isUploading = uploading === item.id;
  const isApproved = item.status === "APPROVED";
  const isRejected = item.status === "REJECTED";
  // Persistent "uploaded" state driven by the item's real status (survives refresh).
  const isUploaded = ["UPLOADED", "UNDER_REVIEW"].includes(item.status);
  const pct = progress ?? 0;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, item.id),
    accept: item.acceptedFormats.reduce((acc, fmt) => {
      if (fmt === "PDF") acc["application/pdf"] = [".pdf"];
      if (fmt === "JPEG" || fmt === "JPG") acc["image/jpeg"] = [".jpg", ".jpeg"];
      if (fmt === "PNG") acc["image/png"] = [".png"];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    maxSize: item.maxFileSizeMb * 1024 * 1024,
    disabled: isUploading || isApproved,
  });

  return (
    <div className={`rounded-2xl border p-5 ${isRejected ? "border-red-200 bg-red-50/30" : isApproved ? "border-emerald-200 bg-emerald-50/20" : isUploaded ? "border-emerald-100 bg-emerald-50/10" : "border-slate-100 bg-white"} shadow-sm`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{item.title}</p>
          {item.description && <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>}
          <p className="mt-1 text-[10px] text-slate-400">Accepted: {item.acceptedFormats.join(", ")} · Max {item.maxFileSizeMb}MB</p>
        </div>
        <StatusBadge status={item.status as "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"} type="checklist" />
      </div>

      {isRejected && item.rejectionReason && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-100 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span><strong>Rejected:</strong> {item.rejectionReason}. Please re-upload a corrected document.</span>
        </div>
      )}

      {/* Uploading — live progress bar */}
      {isUploading ? (
        <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5">
          <div className="flex items-center justify-between text-xs font-medium text-indigo-700">
            <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
            <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-200" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : isApproved ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
          <Check className="h-4 w-4" /> Document approved
        </div>
      ) : isUploaded ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 p-3">
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <Check className="h-4 w-4" /> Uploaded — awaiting review
          </span>
          <div {...getRootProps()} className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-800">
            <input {...getInputProps()} />
            Replace
          </div>
        </div>
      ) : (
        <div {...getRootProps()} className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${isDragActive ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
          <input {...getInputProps()} />
          <Upload className="h-6 w-6 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">{isDragActive ? "Drop here" : "Click or drag to upload"}</p>
        </div>
      )}
    </div>
  );
}
