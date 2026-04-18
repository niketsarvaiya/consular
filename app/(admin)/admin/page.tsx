import { getDashboardMetrics } from "@/lib/services/application.service";
import { PageHeader } from "@/components/shared/PageHeader";
import { FolderOpen, Clock, CreditCard, CheckCircle2, TrendingUp, AlertTriangle, Globe, Users } from "lucide-react";
import Link from "next/link";

function MetricCard({ title, value, sub, icon: Icon, href, highlight }: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string; highlight?: boolean;
}) {
  const content = (
    <div className={`rounded-2xl border p-5 shadow-sm transition-shadow ${highlight ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white hover:shadow-md"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
          <p className={`mt-2 text-3xl font-semibold ${highlight ? "text-amber-700" : "text-slate-900"}`}>{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`rounded-xl p-2 ${highlight ? "bg-amber-100" : "bg-slate-100"}`}>
          <Icon className={`h-5 w-5 ${highlight ? "text-amber-600" : "text-slate-500"}`} />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminOverviewPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <PageHeader title="Overview" description="Platform metrics and pending actions" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Cases" value={metrics.totalCases} sub={`+${metrics.newToday} today`} icon={FolderOpen} href="/admin/cases" />
        <MetricCard title="Active Cases" value={metrics.activeCases} sub="In progress" icon={TrendingUp} href="/admin/cases" />
        <MetricCard title="Docs Pending Review" value={metrics.pendingDocReview} highlight={metrics.pendingDocReview > 0} icon={Clock} href="/admin/cases?status=DOCS_UNDER_REVIEW" />
        <MetricCard title="Payment Pending" value={metrics.pendingPayment} icon={CreditCard} href="/admin/cases?status=PAYMENT_PENDING" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Approved This Month" value={metrics.approvedThisMonth} icon={CheckCircle2} />
        <MetricCard title="Revenue This Month" value={`₹${metrics.revenueThisMonth.toLocaleString("en-IN")}`} icon={TrendingUp} />
        <MetricCard title="Avg. Processing Days" value={metrics.avgProcessingDays} sub="For closed cases" icon={Clock} />
        <MetricCard title="Policies Needing Review" value={metrics.policiesNeedingReview} highlight={metrics.policiesNeedingReview > 0} icon={AlertTriangle} href="/admin/policy?status=NEEDS_REVIEW" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/admin/cases" className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
              <FolderOpen className="h-5 w-5 text-slate-400" />
              <div><p className="text-sm font-medium text-slate-900">View all cases</p><p className="text-xs text-slate-400">Manage applications</p></div>
            </Link>
            <Link href="/admin/policy" className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
              <Globe className="h-5 w-5 text-slate-400" />
              <div><p className="text-sm font-medium text-slate-900">Policy engine</p><p className="text-xs text-slate-400">Refresh & review policies</p></div>
            </Link>
            <Link href="/admin/team" className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
              <Users className="h-5 w-5 text-slate-400" />
              <div><p className="text-sm font-medium text-slate-900">Team management</p><p className="text-xs text-slate-400">Manage ops users</p></div>
            </Link>
            <Link href="/admin/audit" className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
              <div><p className="text-sm font-medium text-slate-900">Audit log</p><p className="text-xs text-slate-400">All admin actions</p></div>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">System status</h2>
          <div className="space-y-3">
            {[
              { label: "Database", status: "operational" },
              { label: "Document storage (S3)", status: "operational" },
              { label: "Payment gateway (Razorpay)", status: "operational" },
              { label: "Email notifications", status: "operational" },
              { label: "Background workers", status: "operational" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
