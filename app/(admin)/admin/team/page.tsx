import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { Shield, User } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Team" };

const ROLE_CONFIG = {
  ADMIN:  { label: "Admin",  description: "Full access — manage policies, cases, and team", color: "bg-purple-100 text-purple-700" },
  OPS:    { label: "Ops",    description: "Manage cases and review documents", color: "bg-blue-100 text-blue-700" },
  VIEWER: { label: "Viewer", description: "Read-only access to cases", color: "bg-slate-100 text-slate-600" },
};

export default async function AdminTeamPage() {
  const session = await getServerSession(authOptions);

  const members = await prisma.opsUser.findMany({
    where: { deletedAt: null },
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
  });

  return (
    <div>
      <PageHeader title="Team" description="Manage ops team members and their roles" />

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Member</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Permissions</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role];
              const isCurrentUser = session?.user.email === member.email;
              return (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {member.fullName}
                          {isCurrentUser && <span className="ml-2 text-[10px] text-slate-400">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${roleConfig.color}`}>
                      {member.role === "ADMIN" && <Shield className="h-3 w-3" />}
                      {roleConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{roleConfig.description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex h-2 w-2 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className="ml-2 text-xs text-slate-500">{member.isActive ? "Active" : "Inactive"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-700">Adding team members</p>
        <p className="mt-1 text-xs text-slate-500">
          To add a new team member, insert a record directly into the <code className="font-mono text-slate-700">ops_users</code> table with a bcrypt-hashed password. A self-service invite flow will be added in V2.
        </p>
        <div className="mt-3 rounded-lg bg-slate-900 p-3">
          <code className="text-[11px] text-slate-300">
            {`INSERT INTO ops_users (email, full_name, password_hash, role)`}<br />
            {`VALUES ('new@consular.in', 'New Member', '<bcrypt>', 'OPS');`}
          </code>
        </div>
      </div>
    </div>
  );
}
