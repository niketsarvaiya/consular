import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowLeft, Upload, CreditCard, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
              <Link href={`/dashboard/application/${app.id}/documents`} className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" /> Upload documents
              </Link>
            </div>

            <div className="space-y-2">
              {app.checklistItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center gap-2">
                    {item.status === "APPROVED" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                     item.status === "REJECTED" ? <AlertCircle className="h-4 w-4 text-red-400" /> :
                     <Circle className="h-4 w-4 text-slate-300" />}
                    <div>
                      <p className="text-sm text-slate-700">{item.title}</p>
                      {item.rejectionReason && <p className="text-xs text-red-500 mt-0.5">{item.rejectionReason}</p>}
                      {item.customerNote && <p className="text-xs text-slate-400 mt-0.5">{item.customerNote}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!item.isRequired && <span className="text-[10px] text-slate-400">Optional</span>}
                    <StatusBadge status={item.status} type="checklist" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{approvedRequired}/{requiredItems.length} required documents approved</span>
                {isMinimumMet && app.status === "PAYMENT_PENDING" && (
                  <Link href={`/dashboard/application/${app.id}/payment`} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
                    <CreditCard className="h-3.5 w-3.5" /> Proceed to payment
                  </Link>
                )}
              </div>
            </div>
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
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 mt-1.5" />
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
