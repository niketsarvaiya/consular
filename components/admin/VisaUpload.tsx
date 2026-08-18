"use client";

import { useState } from "react";
import { Loader2, Upload, FileCheck2, ExternalLink } from "lucide-react";

export function VisaUpload({
  applicationId,
  initialFileName,
  initialIssuedAt,
}: {
  applicationId: string;
  initialFileName: string | null;
  initialIssuedAt: string | null;
}) {
  const [fileName, setFileName] = useState(initialFileName);
  const [issuedAt, setIssuedAt] = useState(initialIssuedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/cases/${applicationId}/visa`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Upload failed.");
      setFileName(file.name);
      setIssuedAt(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const view = async () => {
    const res = await fetch(`/api/admin/cases/${applicationId}/visa`);
    const data = await res.json();
    if (data?.data?.url) window.open(data.data.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <FileCheck2 className="h-4 w-4 text-emerald-500" /> Issued visa document
      </h3>

      {fileName ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          <p className="truncate text-sm font-medium text-slate-800">{fileName}</p>
          {issuedAt && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              Uploaded {new Date(issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <button onClick={view} className="flex items-center gap-1.5 text-xs font-semibold text-iris-600 hover:text-iris-800">
              <ExternalLink className="h-3.5 w-3.5" /> View
            </button>
            <label className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-slate-700">
              {busy ? "Uploading…" : "Replace"}
              <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
            </label>
          </div>
        </div>
      ) : (
        <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${busy ? "border-iris-200 bg-iris-50/40" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin text-iris-500" /> : <Upload className="h-5 w-5 text-slate-300" />}
          <span className="mt-1.5 text-xs text-slate-500">{busy ? "Uploading…" : "Upload the visa received from the embassy"}</span>
          <span className="mt-0.5 text-[10px] text-slate-400">PDF, JPEG or PNG · max 10MB</span>
          <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-[10px] text-slate-400">The customer can download this from their application page.</p>
    </div>
  );
}
