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
  const [error, setError] = useState("");
  const [successItemId, setSuccessItemId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/applications/${id}`).then((r) => r.json()).then((data) => {
      if (data.success) setApplication(data.data);
    });
  }, [id]);

  const handleDrop = useCallback(async (acceptedFiles: File[], itemId: string) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setError("");
    setUploading(itemId);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("checklistItemId", itemId);

    const res = await fetch(`/api/applications/${id}/documents`, { method: "POST", body: formData });
    const data = await res.json();
    setUploading(null);

    if (!data.success) { setError(data.error ?? "Upload failed."); return; }

    setSuccessItemId(itemId);
    setTimeout(() => setSuccessItemId(null), 3000);

    // Refresh application data
    const refreshed = await fetch(`/api/applications/${id}`).then((r) => r.json());
    if (refreshed.success) setApplication(refreshed.data);
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
        <DocumentSection title="Required Documents" items={requiredItems} onDrop={handleDrop} uploading={uploading} successItemId={successItemId} />
        {optionalItems.length > 0 && <DocumentSection title="Optional Documents" items={optionalItems} onDrop={handleDrop} uploading={uploading} successItemId={successItemId} optional />}
      </div>
    </div>
  );
}

function DocumentSection({ title, items, onDrop, uploading, successItemId, optional }: {
  title: string; items: ChecklistItem[];
  onDrop: (files: File[], itemId: string) => void;
  uploading: string | null; successItemId: string | null; optional?: boolean;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        {title}
        {optional && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">Optional</span>}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <DocumentItemCard key={item.id} item={item} onDrop={onDrop} uploading={uploading} successItemId={successItemId} />
        ))}
      </div>
    </div>
  );
}

function DocumentItemCard({ item, onDrop, uploading, successItemId }: {
  item: ChecklistItem; onDrop: (files: File[], itemId: string) => void;
  uploading: string | null; successItemId: string | null;
}) {
  const isUploading = uploading === item.id;
  const isSuccess = successItemId === item.id;
  const isApproved = item.status === "APPROVED";
  const isRejected = item.status === "REJECTED";

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
    <div className={`rounded-2xl border p-5 ${isRejected ? "border-red-200 bg-red-50/30" : isApproved ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100 bg-white"} shadow-sm`}>
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

      {!isApproved && (
        <div {...getRootProps()} className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${isDragActive ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
          <input {...getInputProps()} />
          {isUploading ? (
            <><Loader2 className="h-6 w-6 animate-spin text-slate-400" /><p className="mt-2 text-xs text-slate-400">Uploading...</p></>
          ) : isSuccess ? (
            <><Check className="h-6 w-6 text-emerald-500" /><p className="mt-2 text-xs text-emerald-600">Uploaded successfully</p></>
          ) : (
            <><Upload className="h-6 w-6 text-slate-300" /><p className="mt-2 text-sm text-slate-500">{isDragActive ? "Drop here" : "Click or drag to upload"}</p></>
          )}
        </div>
      )}

      {isApproved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
          <Check className="h-4 w-4" /> Document approved
        </div>
      )}
    </div>
  );
}
