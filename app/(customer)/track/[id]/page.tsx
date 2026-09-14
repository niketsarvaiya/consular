import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { verifyTrackingToken } from "@/lib/services/trip.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Track your visa", robots: { index: false } };

const STEPS = [
  { key: "DOCS_PENDING",     label: "Documents" },
  { key: "PAYMENT_PENDING",  label: "Payment" },
  { key: "FILED",            label: "Filed with embassy" },
  { key: "APPROVED",         label: "Visa issued" },
];
// Where each real status sits on the 4-step public view.
const STEP_INDEX: Record<string, number> = {
  NEW_LEAD: 0, DOCS_PENDING: 0, DOCS_UNDER_REVIEW: 0, ADDITIONAL_DOCS_REQUESTED: 0,
  PAYMENT_PENDING: 1, PAYMENT_RECEIVED: 2, READY_TO_FILE: 2, FILED: 2, APPOINTMENT_PENDING: 2,
  BIOMETRICS_PENDING: 2, SUBMITTED: 2, APPROVED: 3, REJECTED: 3, CLOSED: 3,
};

interface Props { params: { id: string }; searchParams: { t?: string } }

/**
 * Public, read-only status page for a traveller who was added to someone else's trip.
 * Access is by signed link only — no PII beyond first name + destination is shown.
 */
export default async function TrackPage({ params, searchParams }: Props) {
  if (!verifyTrackingToken(params.id, searchParams.t)) notFound();

  const app = await prisma.application.findUnique({
    where: { id: params.id },
    select: {
      status: true, visaType: true, createdAt: true, updatedAt: true,
      country: { select: { name: true, flagUrl: true } },
      passport: { select: { fullName: true } },
      customer: { select: { fullName: true } },
    },
  });
  if (!app) notFound();

  const firstName = app.passport.fullName.split(" ")[0];
  const step = STEP_INDEX[app.status] ?? 0;
  const done = app.status === "APPROVED";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-iris">Visa status</p>
      <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
        Hi {firstName}, here&apos;s your <span className="text-gradient">{app.country.name}</span> visa.
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Applied by <strong className="text-ink">{app.customer.fullName}</strong> ·{" "}
        {app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase()} visa · started{" "}
        {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {app.country.flagUrl && <img src={app.country.flagUrl} alt="" className="h-7 w-10 rounded object-cover" />}
            <p className="font-semibold text-ink">{app.country.name}</p>
          </div>
          <StatusBadge status={app.status} type="application" />
        </div>

        <ol className="mt-8 space-y-0">
          {STEPS.map((s, i) => {
            const isDone = i < step || (i === step && done);
            const isCurrent = i === step && !done;
            return (
              <li key={s.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    isDone ? "bg-emerald-500 text-white" : isCurrent ? "bg-ink text-white" : "bg-slate-100 text-slate-400"}`}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </span>
                  {i < STEPS.length - 1 && <span className={`my-1 w-0.5 flex-1 ${isDone ? "bg-emerald-300" : "bg-slate-100"}`} style={{ minHeight: 28 }} />}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-semibold ${isCurrent ? "text-ink" : isDone ? "text-slate-700" : "text-slate-400"}`}>{s.label}</p>
                  {isCurrent && <p className="mt-0.5 text-xs text-slate-500">In progress — we&apos;ll update this page as it moves.</p>}
                </div>
              </li>
            );
          })}
        </ol>

        {app.status === "REJECTED" && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            This application was not approved. {app.customer.fullName} has the details.
          </p>
        )}

        <p className="mt-2 text-xs text-slate-400">
          Last updated {new Date(app.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="mt-8 rounded-3xl bg-sunset p-6 text-white sm:p-8">
        <p className="font-display text-lg font-bold">Planning your own trip next?</p>
        <p className="mt-1 text-sm text-white/85">Track every visa, upload documents once, and reuse your passport across applications.</p>
        <Link href="/auth/register" className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-white/90">
          Create a free account
        </Link>
      </div>
    </div>
  );
}
