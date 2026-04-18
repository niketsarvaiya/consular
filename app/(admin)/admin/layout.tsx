import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get("x-pathname") ?? "";

  // Skip auth check on the login page itself to prevent redirect loop
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.userType !== "ops") redirect("/admin/login");

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-auto"><div className="p-8">{children}</div></main>
    </div>
  );
}
