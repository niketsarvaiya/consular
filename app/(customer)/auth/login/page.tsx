"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, Globe2, BadgeIndianRupee } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("customer-credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Invalid email or password."); return; }
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
            The clearest path
            <br />
            to your next visa.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-indigo-300/80">
            A structured, document-first workflow that tells you exactly what to prepare — before you even pay.
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
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Log in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Log in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
