"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, Check, ShieldCheck, Globe2, BadgeIndianRupee } from "lucide-react";

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
    <div className="flex min-h-screen">
      {/* Left brand panel — hidden on mobile */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-indigo-950 px-12 py-12 lg:flex">
        {/* Decorative background text */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 select-none text-[200px] font-black leading-none text-white/[0.03]"
        >
          CO
        </div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-400 px-2.5">
              <span className="text-xs font-bold tracking-wide text-white">CO</span>
            </div>
            <span className="text-lg font-semibold text-white">Consular</span>
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            For Indian Passport Holders
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-snug text-white">
            Your visa journey
            <br />
            starts here.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-indigo-300/80">
            Create your free account and get a personalised document checklist for your destination in minutes.
          </p>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-800">
                <ShieldCheck className="h-4 w-4 text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">End-to-end encryption</p>
                <p className="text-xs text-indigo-400">Your documents are encrypted at rest and in transit.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-800">
                <Globe2 className="h-4 w-4 text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">25+ countries supported</p>
                <p className="text-xs text-indigo-400">UAE, UK, Australia, Singapore, and more.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-800">
                <BadgeIndianRupee className="h-4 w-4 text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Transparent fees</p>
                <p className="text-xs text-indigo-400">No hidden charges — see the full cost before you apply.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer note */}
        <div className="relative">
          <p className="text-xs text-indigo-600">
            Visa approval is at the sole discretion of the respective embassy or government authority.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 px-2.5">
              <span className="text-xs font-bold tracking-wide text-white">CO</span>
            </div>
            <span className="text-lg font-semibold text-slate-900">Consular</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="mt-1.5 text-sm text-slate-500">Start your visa application in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="As on passport"
              />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Min. 8 characters"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  form.consentGiven ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                }`}
                onClick={() => setForm({ ...form, consentGiven: !form.consentGiven })}
              >
                {form.consentGiven && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs text-slate-500">
                I consent to the storage and processing of my personal documents for visa application purposes. I
                understand visa approval is at embassy discretion.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !form.consentGiven}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Log in
            </Link>
          </p>
        </div>
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
