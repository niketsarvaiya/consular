import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { TeamManager } from "@/components/admin/TeamManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Team" };

export default async function AdminTeamPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user.role === "ADMIN";

  const [members, countries] = await Promise.all([
    prisma.opsUser.findMany({
      where: { deletedAt: null },
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
      select: {
        id: true, email: true, fullName: true, role: true, isActive: true,
        countries: { select: { id: true, name: true, code: true }, orderBy: { name: "asc" } },
      },
    }),
    prisma.country.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Team" description="Create agents and assign the destinations they handle" />

      {isSuperAdmin ? (
        <div className="mt-6">
          <TeamManager members={members} countries={countries} currentUserId={session!.user.id} />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Only a super admin can manage the team.
        </div>
      )}
    </div>
  );
}
