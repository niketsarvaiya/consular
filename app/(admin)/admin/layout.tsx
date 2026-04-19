import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    console.error("[AdminLayout] getServerSession failed:", (e as Error).message);
    redirect("/admin-login");
  }
  if (!session || session.user.userType !== "ops") redirect("/admin-login");
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-auto"><div className="p-8">{children}</div></main>
    </div>
  );
}
