"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AlertTriangle, Loader2, X } from "lucide-react";

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const deleteAccount = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Something went wrong. Please contact support@visasetgo.com.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 rounded-[28px] border border-red-100 bg-red-50/40 p-6 sm:p-7">
      <h3 className="flex items-center gap-2 text-sm font-bold text-red-700">
        <AlertTriangle className="h-4 w-4" /> Delete account & data
      </h3>
      <p className="mt-1 max-w-xl text-xs leading-relaxed text-red-600/80">
        Permanently erase your account, applications, and every uploaded document
        (passport, photos, etc.) from our systems. This cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        Delete my account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-bold text-ink">Delete your account?</h4>
              <button type="button" onClick={() => { setOpen(false); setConfirmText(""); }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              This permanently deletes all your data — documents, passport details,
              and applications — from our database and file storage. It cannot be
              recovered.
            </p>
            <label className="mt-4 block text-xs font-medium text-slate-600">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink outline-none focus:border-red-400"
              placeholder="DELETE"
              autoFocus
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setConfirmText(""); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== "DELETE" || busy}
                onClick={deleteAccount}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Permanently delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
