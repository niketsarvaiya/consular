import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Destinations" };

const VISA_CATEGORY_LABELS: Record<string, string> = {
  REQUIRED: "Sticker Visa",
  E_VISA: "e-Visa",
  ETA: "ETA",
  VISA_EXEMPT: "Visa-free",
};

const VISA_TYPE_LABELS: Record<string, string> = {
  TOURIST: "Tourist",
  BUSINESS: "Business",
};

export default async function DestinationsPage() {
  const countries = await prisma.country.findMany({
    where: { isActive: true },
    include: {
      policies: {
        where: { status: "ACTIVE", nationality: "IND" },
        select: { visaType: true, visaCategory: true, processingTimeMin: true, processingTimeMax: true, feeDetails: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Choose a destination</h1>
        <p className="mt-2 text-slate-500">Select the country you want to travel to. We'll show you the exact requirements.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => {
          const policies = country.policies;
          if (policies.length === 0) return null;

          return (
            <div key={country.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {country.flagUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={country.flagUrl} alt={`${country.name} flag`} className="h-8 w-12 rounded object-cover" />
                  )}
                  <div>
                    <h2 className="font-semibold text-slate-900">{country.name}</h2>
                    <p className="text-xs text-slate-400">{policies.length} visa type{policies.length > 1 ? "s" : ""} available</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {policies.map((policy) => {
                  const fee = policy.feeDetails as { governmentFeeINR: number; serviceFeeINR: number } | null;
                  const totalFee = fee ? fee.governmentFeeINR + fee.serviceFeeINR : 0;
                  return (
                    <Link
                      key={policy.visaType}
                      href={`/apply/${country.code.toLowerCase()}/${policy.visaType.toLowerCase()}`}
                      className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-slate-300 hover:bg-white"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{VISA_TYPE_LABELS[policy.visaType]} Visa</span>
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">{VISA_CATEGORY_LABELS[policy.visaCategory]}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {policy.processingTimeMin && policy.processingTimeMax
                              ? `${policy.processingTimeMin}–${policy.processingTimeMax} days`
                              : "Varies"}
                          </span>
                          {totalFee > 0 && <span>From ₹{totalFee.toLocaleString("en-IN")}</span>}
                          {totalFee === 0 && <span className="text-emerald-600">No visa fee</span>}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-600" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-center text-xs text-slate-400">
        More destinations are added regularly. All policies are for Indian passport holders only.
      </p>
    </div>
  );
}
