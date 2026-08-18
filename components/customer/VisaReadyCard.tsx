"use client";

import { useState } from "react";
import { Download, Loader2, PartyPopper } from "lucide-react";

export function VisaReadyCard({
  applicationId,
  fileName,
  issuedAt,
}: {
  applicationId: string;
  fileName: string | null;
  issuedAt: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/applications/${applicationId}/visa`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      window.open(data.data.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Couldn't open the document. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-3xl bg-sunset p-6 text-white shadow-xl shadow-iris-600/30 sm:p-7">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <PartyPopper className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-bold">Your visa is ready! 🎉</p>
            <p className="text-sm text-white/85">
              {fileName ?? "Visa document"}
              {issuedAt && ` · issued ${new Date(issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download visa
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-white/90">{error}</p>}
    </div>
  );
}
