"use client";
import { useState } from "react";
import { RefreshCw, Loader2, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface PolicyRefreshButtonProps { policyId: string; countryName: string; }

type RefreshState = "idle" | "queuing" | "polling" | "changes_found" | "no_changes" | "error";

export function PolicyRefreshButton({ policyId, countryName }: PolicyRefreshButtonProps) {
  const [state, setState]   = useState<RefreshState>("idle");
  const [message, setMessage] = useState("");

  const handleRefresh = async () => {
    if (!confirm(`Trigger a policy refresh for ${countryName}?\n\nThis will fetch official sources and compare against the current version. If changes are found you'll see a review banner at the top of this page.`)) return;

    setState("queuing");
    setMessage("");

    try {
      const res  = await fetch(`/api/admin/policies/${policyId}/refresh`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Refresh failed");

      // Job queued — now poll for up to 45s to see if a snapshot was created
      setState("polling");
      const started = Date.now();
      let found = false;

      while (Date.now() - started < 45_000) {
        await new Promise((r) => setTimeout(r, 3000));

        const check = await fetch(`/api/admin/policies/${policyId}/refresh-status`);
        if (check.ok) {
          const status = await check.json();
          if (status.hasNewSnapshot) {
            setState("changes_found");
            setMessage("Changes detected — review the banner above.");
            found = true;
            break;
          }
          if (status.jobCompleted) {
            setState("no_changes");
            setMessage("No changes detected. Policy is up to date.");
            found = true;
            break;
          }
        }
      }

      if (!found) {
        setState("no_changes");
        setMessage("Job is still running — check back shortly.");
      }
    } catch (e: unknown) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Refresh failed");
    }

    // Reset to idle after 8 s
    setTimeout(() => { setState("idle"); setMessage(""); }, 8000);
  };

  const meta: Record<RefreshState, { icon: React.ReactNode; label: string; cls: string }> = {
    idle:           { icon: <RefreshCw className="h-3.5 w-3.5 text-slate-400" />,               label: "Refresh policy",    cls: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50" },
    queuing:        { icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />,   label: "Queuing…",          cls: "border-indigo-200 bg-indigo-50 text-indigo-700 opacity-80" },
    polling:        { icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />,   label: "Checking sources…", cls: "border-indigo-200 bg-indigo-50 text-indigo-700 opacity-80" },
    changes_found:  { icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,           label: "Changes found!",    cls: "border-amber-300 bg-amber-50 text-amber-800" },
    no_changes:     { icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,          label: "Up to date",        cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    error:          { icon: <Info className="h-3.5 w-3.5 text-red-500" />,                      label: "Error",             cls: "border-red-200 bg-red-50 text-red-700" },
  };

  const { icon, label, cls } = meta[state];
  const isRunning = state === "queuing" || state === "polling";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRunning}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed ${cls}`}
      >
        {icon}
        {label}
      </button>
      {message && (
        <p className={`text-[10px] max-w-48 text-right leading-tight ${state === "changes_found" ? "text-amber-600" : state === "error" ? "text-red-500" : "text-slate-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
