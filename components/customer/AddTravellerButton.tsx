"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

/** Wraps the application in a trip (if needed) and sends the user to add the next traveller. */
export function AddTravellerButton({ applicationId, countryCode, visaType, tripId, className = "" }: {
  applicationId: string; countryCode: string; visaType: string; tripId: string | null; className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const go = async () => {
    setBusy(true); setError("");
    try {
      let id = tripId;
      if (!id) {
        const res = await fetch("/api/trips", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Could not start a trip.");
        id = data.data.tripId as string;
      }
      router.push(`/apply/${countryCode.toLowerCase()}/${visaType.toLowerCase()}/passport?trip=${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <button type="button" onClick={go} disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50 disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Add a family member
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
