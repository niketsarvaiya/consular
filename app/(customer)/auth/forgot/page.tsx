"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { LogoLink } from "@/components/shared/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8"><LogoLink className="h-9" /></div>

        {sent ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <MailCheck className="mx-auto h-10 w-10 text-emerald-500" />
            <h1 className="mt-4 font-display text-xl font-bold text-ink">Check your inbox</h1>
            <p className="mt-2 text-sm text-slate-600">
              If <strong>{email}</strong> has an account, a reset link is on its way. It works for one hour.
            </p>
            <Link href="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-iris-600 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to log in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-ink">Forgot your password?</h1>
            <p className="mt-2 text-sm text-slate-600">Enter your email and we&apos;ll send you a link to set a new one.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-iris-400" />
              </div>
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={busy || !email}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-50">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link href="/auth/login" className="font-semibold text-iris-600 hover:underline">Back to log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
