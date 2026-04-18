"use client";
import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

interface PolicyRefreshButtonProps { policyId: string; countryName: string; }

export function PolicyRefreshButton({ policyId, countryName }: PolicyRefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleRefresh = async () => {
    if (!confirm(`Trigger a policy refresh for ${countryName}? This will fetch official sources and compare against the current version.`)) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/policies/${policyId}/refresh`, { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!data.success) { setError(data.error ?? "Refresh failed."); return; }
    setDone(true);
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <div>
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className={`h-3.5 w-3.5 ${done ? "text-emerald-600" : "text-slate-400"}`} />}
        {done ? "Refresh queued!" : loading ? "Queuing..." : "Refresh policy"}
      </button>
    </div>
  );
}
