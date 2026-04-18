"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [form, setForm] = useState({ email: "", password: "", fullName: "", consentGiven: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      if (typeof data.error === "object") setErrors(data.error);
      else setServerError(data.error ?? "Registration failed.");
      return;
    }

    // Auto sign-in after registration
    await signIn("customer-credentials", { email: form.email, password: form.password, redirect: false });
    router.push(next);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">Consular</span>
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Start your visa application in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
          {serverError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" placeholder="As on passport" />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" placeholder="Min. 8 characters" />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${form.consentGiven ? "bg-slate-900 border-slate-900" : "border-slate-300"}`} onClick={() => setForm({ ...form, consentGiven: !form.consentGiven })}>
              {form.consentGiven && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>
            <span className="text-xs text-slate-500">I consent to the storage and processing of my personal documents for visa application purposes. I understand visa approval is at embassy discretion.</span>
          </label>

          <button type="submit" disabled={loading || !form.consentGiven} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-slate-900 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
