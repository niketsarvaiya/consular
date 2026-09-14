"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { LogoLink } from "@/components/shared/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Read off the URL — useSearchParams would force a Suspense boundary at build time.
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token")); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not reset password.");
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  };

  const input = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-iris-400";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8"><LogoLink className="h-9" /></div>

        {token === null ? null : !token ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="font-display text-xl font-bold text-ink">This link isn&apos;t valid</h1>
            <p className="mt-2 text-sm text-slate-600">Request a new reset link and try again.</p>
            <Link href="/auth/forgot" className="mt-4 inline-block text-sm font-semibold text-iris-600 hover:underline">Request a new link</Link>
          </div>
        ) : done ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h1 className="mt-4 font-display text-xl font-bold text-ink">Password updated</h1>
            <p className="mt-2 text-sm text-slate-600">Taking you to log in…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-ink">Set a new password</h1>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
                <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
                <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
                <input id="confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
              </div>
              {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={busy || password.length < 8}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-700 disabled:opacity-50">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
