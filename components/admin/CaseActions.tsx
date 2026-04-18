"use client";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface CaseActionsProps {
  applicationId: string;
  checklistItemId: string;
  currentStatus: string;
}

export function CaseActions({ applicationId, checklistItemId, currentStatus }: CaseActionsProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approve" | "reject" | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  if (currentStatus === "APPROVED" || currentStatus === "PENDING" || done) return null;

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !showRejectForm) { setShowRejectForm(true); return; }
    if (action === "reject" && !rejectionReason.trim()) { setError("Rejection reason is required."); return; }

    setLoading(action);
    setError("");

    const res = await fetch(`/api/admin/cases/${applicationId}/documents/${checklistItemId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejectionReason: action === "reject" ? rejectionReason : undefined }),
    });

    const data = await res.json();
    setLoading(null);

    if (!data.success) { setError(data.error ?? "Action failed."); return; }
    setDone(action);
    setShowRejectForm(false);
  };

  return (
    <div className="mt-2">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {showRejectForm && (
        <div className="mb-2">
          <input
            type="text"
            placeholder="Rejection reason (shown to customer)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      )}

      <div className="flex gap-2">
        {currentStatus !== "APPROVED" && (
          <button
            onClick={() => handleAction("approve")}
            disabled={!!loading}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approve
          </button>
        )}
        {currentStatus !== "REJECTED" && (
          <button
            onClick={() => handleAction("reject")}
            disabled={!!loading}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {loading === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            {showRejectForm ? "Submit rejection" : "Reject"}
          </button>
        )}
        {showRejectForm && (
          <button onClick={() => { setShowRejectForm(false); setRejectionReason(""); }} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
        )}
      </div>
    </div>
  );
}
