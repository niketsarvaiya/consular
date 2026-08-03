import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-coral-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-azure-100/50 blur-3xl" />
      <div className="relative text-center">
        <span className="animate-float inline-block text-6xl">🗺️</span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">Page not found</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Looks like you&apos;ve <span className="text-gradient">wandered off the map.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-sunset px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-iris-600/30 transition-all hover:-translate-y-0.5 hover:brightness-110"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
