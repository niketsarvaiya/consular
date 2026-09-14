import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, CreditCard, FileText } from "lucide-react";
import { getTrip } from "@/lib/services/trip.service";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AddTravellerButton } from "@/components/customer/AddTravellerButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trip" };

interface Props { params: { id: string } }

export default async function TripPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "customer") redirect("/auth/login");

  const trip = await getTrip(params.id, session.user.id);
  if (!trip) notFound();

  const apps = trip.applications;
  const first = apps[0];
  const approved = apps.filter((a) => a.status === "APPROVED").length;
  const paid = apps.filter((a) => a.paymentOrder?.status === "PAID").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> My applications
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-iris">Trip</p>
          <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-ink sm:text-3xl">{trip.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {apps.length} traveller{apps.length === 1 ? "" : "s"} · {approved} approved · {paid} paid
          </p>
        </div>
        {first && (
          <AddTravellerButton applicationId={first.id} countryCode={first.country.code} visaType={first.visaType} tripId={trip.id} />
        )}
      </div>

      {apps.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          No travellers on this trip yet.
        </div>
      )}

      <div className="space-y-3">
        {apps.map((a) => {
          const required = a.checklistItems.filter((i) => i.isRequired);
          const approvedDocs = required.filter((i) => i.status === "APPROVED").length;
          const docsDone = required.length > 0 && approvedDocs === required.length;
          const isPaid = a.paymentOrder?.status === "PAID";

          // The one thing this traveller needs next.
          const next =
            a.status === "APPROVED" ? { icon: CheckCircle2, text: "Visa issued", cls: "text-emerald-600" } :
            a.status === "REJECTED" ? { icon: Clock, text: "Not approved", cls: "text-red-600" } :
            !docsDone ? { icon: FileText, text: `${approvedDocs}/${required.length} documents approved`, cls: "text-slate-500" } :
            !isPaid ? { icon: CreditCard, text: "Payment due", cls: "text-amber-600" } :
            { icon: Clock, text: "Being processed", cls: "text-slate-500" };

          return (
            <Link key={a.id} href={`/dashboard/application/${a.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div className="flex min-w-0 items-center gap-4">
                {a.country.flagUrl && <img src={a.country.flagUrl} alt="" className="h-6 w-9 rounded object-cover" />}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{a.passport.fullName}</p>
                  <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${next.cls}`}>
                    <next.icon className="h-3.5 w-3.5" /> {next.text}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={a.status} type="application" />
                <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
