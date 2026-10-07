import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { PageHeader } from "@/components/shared/PageHeader";
import { AgentsManager } from "@/components/admin/AgentsManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Agents & Coins" };

export default async function AdminAgentsPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user.role === "ADMIN";

  const select = {
    id: true, email: true, fullName: true, agencyName: true, isAgent: true, coinBalance: true,
    _count: { select: { applications: true } },
    coinLedger: { orderBy: { createdAt: "desc" as const }, take: 25 },
  } satisfies Prisma.CustomerSelect;

  const [agentRows, otherRows] = await Promise.all([
    prisma.customer.findMany({ where: { isAgent: true, deletedAt: null }, select, orderBy: { coinBalance: "desc" } }),
    prisma.customer.findMany({ where: { isAgent: false, deletedAt: null }, select, orderBy: { createdAt: "desc" }, take: 500 }),
  ]);

  const shape = (c: (typeof agentRows)[number]) => ({
    id: c.id, email: c.email, fullName: c.fullName, agencyName: c.agencyName,
    isAgent: c.isAgent, coinBalance: c.coinBalance, applications: c._count.applications,
    ledger: c.coinLedger.map((l) => ({
      id: l.id, delta: l.delta, balanceAfter: l.balanceAfter, reason: l.reason,
      note: l.note, createdAt: l.createdAt.toISOString(),
    })),
  });

  const totalFloat = agentRows.reduce((sum, a) => sum + a.coinBalance, 0);

  return (
    <div>
      <PageHeader
        title="Agents & Coins"
        description={`${agentRows.length} agent${agentRows.length === 1 ? "" : "s"} · ₹${totalFloat.toLocaleString("en-IN")} unspent float`}
      />
      <div className="mt-6">
        {isSuperAdmin ? (
          <AgentsManager agents={agentRows.map(shape)} others={otherRows.map(shape)} />
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Only a super admin can manage agents and coin balances.
          </div>
        )}
      </div>
    </div>
  );
}
