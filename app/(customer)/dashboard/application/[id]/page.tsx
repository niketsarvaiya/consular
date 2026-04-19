import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ChecklistSection } from "@/components/customer/ChecklistSection";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { id: string } }
export const metadata: Metadata = { title: "Application Details" };

const STATUS_STEPS = [
  "DOCS_PENDING", "DOCS_UNDER_REVIEW", "PAYMENT_PENDING",
  "PAYMENT_RECEIVED", "READY_TO_FILE", "FILED", "SUBMITTED", "APPROVED",
];

export default async function ApplicationDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "customer") redirect("/auth/login");

  const app = await prisma.application.findFirst({
    where: { id: params.id, customerId: session.user.id },
    include: {
      country: true,
      checklistItems: { orderBy: { sortOrder: "asc" } },
      paymentOrder: true,
      statusHistory: { orderBy: { changedAt: "asc" }, take: 20 },
      notes: { where: { noteType: "customer_visible" }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!app) notFound();

  const requiredItems = app.checklistItems.filter((i) => i.isRequired);
  const approvedRequired = requiredItems.filter((i) => i.status === "APPROVED").length;
  const isMinimumMet = approvedRequired === requiredItems.length && requiredItems.length > 0;

  const currentStepIndex = STATUS_STEPS.indexOf(app.status);

  const checklistItems = app.checklistItems.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    isRequired: i.isRequired,
    acceptedFormats: i.acceptedFormats as string[],
    maxFileSizeMb: i.maxFileSizeMb,
    status: i.status,
    rejectionReason: i.rejectionReason,
    customerNote: i.customerNote,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{app.country.name} – {app.visaType.charAt(0) + app.visaType.slice(1).toLowerCase()} Visa</h1>
          <p className="mt-1 text-sm text-slate-400">Ref: {app.id.slice(-8).toUpperCase()} · Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <StatusBadge status={app.status} type="application" />
      </div>

      {/* Progress stepper */}
      <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Application progress</h2>
        <div className="flex items-center gap-0 overflow-x-auto">
          {STATUS_STEPS.map((step, i) => {
            const isDone = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${isDone ? "bg-emerald-500 text-white" : isCurrent ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <p className="mt-1 max-w-[70px] text-center text-[9px] leading-tight text-slate-400">{step.replace(/_/g, " ")}</p>
                </div>
                {i < STATUS_STEPS.length - 1 && <div className={`mx-1 h-0.5 w-8 shrink-0 ${isDone ? "bg-emerald-300" : "bg-slate-100"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Documents</h2>
              <span className="text-xs text-slate-400">{approvedRequired}/{requiredItems.length} required approved</span>
            </div>

            <ChecklistSection
              applicationId={app.id}
              items={checklistItems}
            />

            {isMinimumMet && app.status === "PAYMENT_PENDING" && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link href={`/dashboard/application/${app.id}/payment`} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                  <CreditCard className="h-4 w-4" /> Proceed to payment
                </Link>
              </div>
            )}
          </div>

          {app.notes.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Updates from our team</h2>
              <div className="space-y-3">
                {app.notes.map((note) => (
                  <div key={note.id} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(note.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {app.paymentOrder && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</h3>
              <p className="mt-2 text-2xl font-semibold text-slate-900">₹{Math.round(app.paymentOrder.amount / 100).toLocaleString("en-IN")}</p>
              <p className={`mt-1 text-xs font-medium ${app.paymentOrder.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                {app.paymentOrder.status === "PAID" ? "Payment received" : "Payment pending"}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Timeline</h3>
            <div className="mt-3 space-y-2">
              {app.statusHistory.slice(-5).map((h, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  <div>
                    <span className="font-medium text-slate-700">{h.toStatus.replace(/_/g, " ")}</span>
                    <span className="ml-2 text-slate-400">{new Date(h.changedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-400 leading-relaxed">
            Visa approval is at the sole discretion of the respective embassy or government authority. Consular does not guarantee visa approval.
          </div>
        </div>
      </div>
    </div>
  );
}
