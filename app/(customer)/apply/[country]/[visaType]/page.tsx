import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, CreditCard, FileText, Info, ShieldCheck, Banknote, CalendarDays } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props { params: { country: string; visaType: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Apply – ${params.country.toUpperCase()} ${params.visaType} Visa` };
}

const VISA_CATEGORY_LABELS: Record<string, string> = {
  REQUIRED: "Sticker Visa",
  E_VISA: "e-Visa",
  ETA: "ETA",
  VISA_EXEMPT: "Visa-free",
};

const VISA_CATEGORY_COLORS: Record<string, string> = {
  REQUIRED: "bg-purple-100 text-purple-700",
  E_VISA: "bg-blue-100 text-blue-700",
  ETA: "bg-amber-100 text-amber-700",
  VISA_EXEMPT: "bg-emerald-100 text-emerald-700",
};

export default async function ApplyStartPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const country = await prisma.country.findFirst({
    where: { code: params.country.toUpperCase(), isActive: true },
  });
  if (!country) notFound();

  const policy = await prisma.visaPolicy.findFirst({
    where: {
      countryId: country.id,
      visaType: params.visaType.toUpperCase() as "TOURIST" | "BUSINESS",
      nationality: "IND",
      status: "ACTIVE",
    },
    include: { country: true },
  });
  if (!policy) notFound();

  const fee = policy.feeDetails as { governmentFeeINR: number; serviceFeeINR: number; taxes?: number; notes?: string } | null;
  const reqDocs = (policy.requiredDocuments as { title: string; key: string; notes?: string }[]) ?? [];
  const totalFee = fee ? fee.governmentFeeINR + fee.serviceFeeINR : 0;
  const visaTypeLabel = params.visaType.charAt(0).toUpperCase() + params.visaType.slice(1).toLowerCase();
  const categoryLabel = VISA_CATEGORY_LABELS[policy.visaCategory] ?? policy.visaCategory;
  const categoryColor = VISA_CATEGORY_COLORS[policy.visaCategory] ?? "bg-slate-100 text-slate-700";

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Link href="/destinations" className="hover:text-slate-600">Destinations</Link>
              <span>/</span>
              <span>{country.name}</span>
              <span>/</span>
              <span>{visaTypeLabel} Visa</span>
            </div>
            <div className="mt-4 flex items-center gap-4">
              {country.flagUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={country.flagUrl} alt="" className="h-14 w-20 rounded-lg object-cover shadow-sm" />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900">{country.name}</h1>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColor}`}>{categoryLabel}</span>
                </div>
                <p className="mt-1 text-slate-500">{visaTypeLabel} Visa · For Indian passport holders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 text-center">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-10">
            <ShieldCheck className="mx-auto h-10 w-10 text-indigo-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900">Create a free account to apply</h2>
            <p className="mt-2 text-slate-500">Track your application, upload documents, and get updates — all in one place.</p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/auth/register?next=/apply/${params.country}/${params.visaType}`}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/auth/login?next=/apply/${params.country}/${params.visaType}`}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Already have an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Country hero banner */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
            <Link href="/destinations" className="hover:text-slate-600">Destinations</Link>
            <span>/</span>
            <span>{country.name}</span>
            <span>/</span>
            <span>{visaTypeLabel} Visa</span>
          </div>
          <div className="flex items-center gap-5">
            {country.flagUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={country.flagUrl} alt="" className="h-14 w-20 rounded-lg object-cover shadow-sm" />
            )}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{country.name}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColor}`}>{categoryLabel}</span>
              </div>
              <p className="mt-1 text-slate-500">{visaTypeLabel} Visa · Indian passport holders only</p>
            </div>
          </div>

          {/* Key stats */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Banknote className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Total Fee</span>
              </div>
              {totalFee > 0 ? (
                <p className="text-xl font-bold text-slate-900">₹{totalFee.toLocaleString("en-IN")}</p>
              ) : (
                <p className="text-xl font-bold text-emerald-600">Free</p>
              )}
              {fee && <p className="mt-0.5 text-[11px] text-slate-400">Govt ₹{fee.governmentFeeINR.toLocaleString("en-IN")} + Svc ₹{fee.serviceFeeINR.toLocaleString("en-IN")}</p>}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Processing</span>
              </div>
              <p className="text-xl font-bold text-slate-900">
                {policy.processingTimeMin && policy.processingTimeMax
                  ? `${policy.processingTimeMin}–${policy.processingTimeMax}d`
                  : "Varies"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Business days</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <FileText className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Documents</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{reqDocs.length}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Required items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">

        {/* How it works */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">How it works</h2>
          <div className="space-y-4">
            {[
              { icon: FileText, label: "Enter passport details", desc: "Your passport info is encrypted and stored securely for future applications.", color: "bg-indigo-50 text-indigo-600" },
              { icon: CheckCircle2, label: `Upload ${reqDocs.length} required document${reqDocs.length !== 1 ? "s" : ""}`, desc: "Upload directly from your phone or computer. Our team reviews each document.", color: "bg-emerald-50 text-emerald-600" },
              { icon: CreditCard, label: "Pay only after approval", desc: "You're not charged until all documents are reviewed and approved by our team.", color: "bg-amber-50 text-amber-600" },
              { icon: CalendarDays, label: "Receive your visa", desc: "We submit to the embassy and notify you as soon as your visa is ready.", color: "bg-violet-50 text-violet-600" },
            ].map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${step.color}`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  {i < 3 && <div className="w-px flex-1 bg-slate-100 min-h-[16px]" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Required documents */}
        {reqDocs.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Required documents</h2>
            <div className="space-y-2">
              {reqDocs.map((doc, i) => (
                <div key={doc.key} className="flex items-start gap-3 rounded-xl border border-slate-50 bg-slate-50 px-4 py-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                    {doc.notes && <p className="mt-0.5 text-xs text-slate-500">{doc.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {policy.processingNotes && (
          <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{policy.processingNotes}</p>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">You pay only after documents are approved</p>
              <p className="mt-0.5 text-xs text-slate-500">No upfront payment. Our team reviews your documents before any charge.</p>
            </div>
          </div>
          <Link
            href={`/apply/${params.country}/${params.visaType}/passport`}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Start application <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-center text-xs text-slate-400">
            Visa approval is at the sole discretion of the respective embassy.
          </p>
        </div>
      </div>
    </div>
  );
}
