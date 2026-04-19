import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import { VisaPageClient } from "@/components/customer/VisaPageClient";
import {
  getHeroImages,
  getCountryInfo,
  getCountryFAQ,
  getSuccessTips,
} from "@/lib/visa-content";

export const dynamic = "force-dynamic";

interface Props { params: { country: string; visaType: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${params.country.toUpperCase()} ${params.visaType} Visa – Consular` };
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
  });
  if (!policy) notFound();

  const fee = policy.feeDetails as { governmentFeeINR: number; serviceFeeINR: number; taxes?: number; notes?: string } | null;
  const reqDocs = (policy.requiredDocuments as { title: string; key: string; notes?: string }[]) ?? [];
  const totalFee = fee ? fee.governmentFeeINR + fee.serviceFeeINR : 0;
  const visaTypeLabel = params.visaType.charAt(0).toUpperCase() + params.visaType.slice(1).toLowerCase();
  const code = params.country.toUpperCase();

  return (
    <VisaPageClient
      countryName={country.name}
      countryCode={code}
      countryFlagUrl={country.flagUrl}
      visaTypeLabel={visaTypeLabel}
      categoryLabel={VISA_CATEGORY_LABELS[policy.visaCategory] ?? policy.visaCategory}
      categoryColor={VISA_CATEGORY_COLORS[policy.visaCategory] ?? "bg-slate-100 text-slate-700"}
      totalFee={totalFee}
      fee={fee}
      processingTimeMin={policy.processingTimeMin}
      processingTimeMax={policy.processingTimeMax}
      processingNotes={policy.processingNotes}
      reqDocs={reqDocs}
      heroImages={getHeroImages(code)}
      countryInfo={getCountryInfo(code)}
      faqData={getCountryFAQ(code)}
      successTips={getSuccessTips(code)}
      isLoggedIn={!!session}
      applyPath={`/apply/${params.country}/${params.visaType}/passport`}
      registerPath={`/auth/register?next=/apply/${params.country}/${params.visaType}`}
      loginPath={`/auth/login?next=/apply/${params.country}/${params.visaType}`}
    />
  );
}
