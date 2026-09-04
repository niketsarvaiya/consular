import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { CoverLetterTool } from "@/components/customer/CoverLetterTool";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visa Cover Letter Generator",
  description: "Draft a formal, consulate-ready covering letter for every traveller on your trip.",
};

export default async function CoverLetterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.userType !== "customer") redirect("/auth/login?next=/tools/cover-letter");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
      <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ink print:hidden">
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>

      <div className="mb-8 print:hidden">
        <h1 className="font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">Cover Letter Generator</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Every traveller gets their own individually-signed letter — consulates expect that, not one combined family letter.
          Nothing is invented: anything we don&apos;t have is left as a clearly marked placeholder for you to fill in.
        </p>
      </div>

      <CoverLetterTool />
    </div>
  );
}
