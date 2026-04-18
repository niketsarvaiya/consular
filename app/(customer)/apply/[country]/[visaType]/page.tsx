import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ArrowRight, Check, Clock, CreditCard, FileText, Info } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: { country: string; visaType: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Apply – ${params.country.toUpperCase()} ${params.visaType} Visa` };
}

export default async function ApplyStartPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const country = await prisma.country.findFirst({
    where: { code: params.country.toUpperCase(), isActive: true },
  });
  if (!country) notFound();

  const policy = await prisma.visaPolicy.findFirst({
    where: { countryId: country.id, visaType: params.visaType.toUpperCase() as "TOURIST" | "BUSINESS", nationality: "IND", status: "ACTIVE" },
    include: { country: true },
  });
  if (!policy) notFound();

  const fee = policy.feeDetails as { governmentFeeINR: number; serviceFeeINR: number; taxes?: number; notes?: string } | null;
  const reqDocs = (policy.requiredDocuments as { title: string; key: string }[]) ?? [];

  const STEPS = [
    { icon: FileText, label: "Upload passport", description: "Scan first page — we'll auto-fill your details" },
    { icon: Check, label: "Complete checklist", description: `${reqDocs.length} required documents for this visa` },
    { icon: CreditCard, label: "Pay & confirm", description: "Pay only after all documents are approved" },
  ];

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">{country.name} – {params.visaType.charAt(0).toUpperCase() + params.visaType.slice(1)} Visa</h1>
        <p className="mt-4 text-slate-500">Create a free account to start your application and track progress.</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={`/auth/register?next=/apply/${params.country}/${params.visaType}`} className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Create account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/auth/login?next=/apply/${params.country}/${params.visaType}`} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/destinations" className="hover:text-slate-600">Destinations</Link>
        <span>/</span>
        <span>{country.name}</span>
        <span>/</span>
        <span className="capitalize">{params.visaType} Visa</span>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          {country.flagUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={country.flagUrl} alt="" className="mt-1 h-10 w-16 rounded object-cover" />
          )}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{country.name} – {params.visaType.charAt(0).toUpperCase() + params.visaType.slice(1)} Visa</h1>
            <p className="mt-1 text-sm text-slate-500">For Indian passport holders · Single entry · 30 days</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {fee && (
            <>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Govt. Fee</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">₹{fee.governmentFeeINR.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Service Fee</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">₹{fee.serviceFeeINR.toLocaleString("en-IN")}</p>
              </div>
            </>
          )}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Processing</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {policy.processingTimeMin && policy.processingTimeMax
                ? `${policy.processingTimeMin}–${policy.processingTimeMax} days`
                : "Varies"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-900">How it works</h2>
          <div className="mt-4 space-y-3">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-xs font-semibold text-slate-600">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {policy.processingNotes && (
          <div className="mt-6 flex gap-2 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{policy.processingNotes}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <form action={`/api/applications`} method="post" className="contents">
            <Link
              href={`/apply/${params.country}/${params.visaType}/passport`}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Start application <ArrowRight className="h-4 w-4" />
            </Link>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          You pay only after all documents are approved. Visa approval is at embassy discretion.
        </p>
      </div>

      {reqDocs.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Required documents</h2>
          <ul className="mt-4 space-y-2">
            {reqDocs.map((doc) => (
              <li key={doc.key} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                {doc.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
