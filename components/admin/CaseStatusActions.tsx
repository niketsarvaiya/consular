"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, ArrowRight } from "lucide-react";

const STATUS_TRANSITIONS: Record<string, { label: string; next: string[] }> = {
  NEW_LEAD:                  { label: "New Lead",               next: ["DOCS_PENDING", "CLOSED"] },
  DOCS_PENDING:              { label: "Docs Pending",           next: ["DOCS_UNDER_REVIEW", "CLOSED"] },
  DOCS_UNDER_REVIEW:         { label: "Docs Under Review",      next: ["PAYMENT_PENDING", "ADDITIONAL_DOCS_REQUESTED", "CLOSED"] },
  PAYMENT_PENDING:           { label: "Payment Pending",        next: ["PAYMENT_RECEIVED", "CLOSED"] },
  PAYMENT_RECEIVED:          { label: "Payment Received",       next: ["READY_TO_FILE", "CLOSED"] },
  READY_TO_FILE:             { label: "Ready to File",          next: ["FILED", "CLOSED"] },
  FILED:                     { label: "Filed",                  next: ["APPOINTMENT_PENDING", "BIOMETRICS_PENDING", "SUBMITTED", "CLOSED"] },
  APPOINTMENT_PENDING:       { label: "Appointment Pending",    next: ["BIOMETRICS_PENDING", "SUBMITTED", "CLOSED"] },
  BIOMETRICS_PENDING:        { label: "Biometrics Pending",     next: ["SUBMITTED", "CLOSED"] },
  SUBMITTED:                 { label: "Submitted",              next: ["APPROVED", "REJECTED", "ADDITIONAL_DOCS_REQUESTED"] },
  ADDITIONAL_DOCS_REQUESTED: { label: "Additional Docs Req.",   next: ["DOCS_UNDER_REVIEW", "SUBMITTED", "CLOSED"] },
  APPROVED:                  { label: "Approved",               next: ["CLOSED"] },
  REJECTED:                  { label: "Rejected",               next: ["CLOSED"] },
  CLOSED:                    { label: "Closed",                 next: [] },
};

interface CaseStatusActionsProps {
  applicationId: string;
  currentStatus: string;
}

export function CaseStatusActions({ applicationId, currentStatus }: CaseStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [selectedNext, setSelectedNext] = useState("");

  const meta = STATUS_TRANSITIONS[currentStatus];
  if (!meta || meta.next.length === 0) return null;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cases/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Update failed");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Update Status</h3>
      <p className="text-xs text-slate-500 mb-3">
        Current: <span className="font-semibold text-slate-800">{meta.label}</span>
      </p>

      <div className="space-y-2">
        {meta.next.map((next) => {
          const nextMeta = STATUS_TRANSITIONS[next];
          return (
            <button
              key={next}
              onClick={() => handleStatusChange(next)}
              disabled={loading}
              className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                next === "APPROVED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : next === "REJECTED" || next === "CLOSED"
                  ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{nextMeta?.label ?? next.replace(/_/g, " ")}</span>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
