import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWallet } from "@/lib/services/wallet.service";
import { WalletClient } from "@/components/customer/WalletClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Coin wallet" };

export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "customer") redirect("/auth/login");

  const { customer, ledger } = await getWallet(session.user.id);
  // Agents only — a retail customer has no wallet to see.
  if (!customer?.isAgent) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> My applications
      </Link>
      <h1 className="mb-6 font-display text-2xl font-black tracking-tight text-ink sm:text-3xl">Coin wallet</h1>
      <WalletClient
        balance={customer.coinBalance}
        agencyName={customer.agencyName}
        ledger={ledger.map((l) => ({
          id: l.id, delta: l.delta, balanceAfter: l.balanceAfter,
          reason: l.reason, note: l.note, createdAt: l.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
