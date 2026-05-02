import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Policy Activity Log" };

const SOURCE_LABELS: Record<string, { label: string; cls: string }> = {
  manual_edit:  { label: "Manual Edit",   cls: "bg-indigo-100 text-indigo-700" },
  auto_refresh: { label: "Auto Refresh",  cls: "bg-sky-100 text-sky-700" },
  initial:      { label: "Initial",       cls: "bg-slate-100 text-slate-500" },
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  approved:       { label: "Approved",       cls: "bg-emerald-100 text-emerald-700" },
  rejected:       { label: "Rejected",       cls: "bg-red-100 text-red-600" },
  pending_review: { label: "Pending Review", cls: "bg-amber-100 text-amber-700" },
};

interface Props {
  searchParams: { source?: string; status?: string; country?: string; page?: string };
}

const PAGE_SIZE = 50;

export default async function PolicyLogsPage({ searchParams }: Props) {
  const page   = Math.max(1, Number(searchParams.page ?? 1));
  const source = searchParams.source ?? "";
  const status = searchParams.status ?? "";
  const country = searchParams.country ?? "";

  // Build where clause
  const where: Record<string, unknown> = {};
  if (source)  where.changeSource = source;
  if (status)  where.status = status;
  if (country) {
    where.policy = {
      country: {
        OR: [
          { name: { contains: country, mode: "insensitive" } },
          { code: { contains: country, mode: "insensitive" } },
        ],
      },
    };
  }

  const [snapshots, total] = await Promise.all([
    prisma.policySnapshot.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        policy: {
          include: { country: { select: { name: true, code: true } } },
        },
      },
    }),
    prisma.policySnapshot.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Summary stats (unfiltered)
  const [totalCount, manualCount, autoCount, pendingCount] = await Promise.all([
    prisma.policySnapshot.count(),
    prisma.policySnapshot.count({ where: { changeSource: "manual_edit" } }),
    prisma.policySnapshot.count({ where: { changeSource: "auto_refresh" } }),
    prisma.policySnapshot.count({ where: { status: "pending_review" } }),
  ]);

  // Build filter URL helper
  const filterUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({
      ...(source  && { source }),
      ...(status  && { status }),
      ...(country && { country }),
      ...overrides,
    });
    params.delete("page"); // reset to page 1 on filter change
    const str = params.toString();
    return `/admin/logs${str ? `?${str}` : ""}`;
  };

  const pageUrl = (p: number) => {
    const params = new URLSearchParams({
      ...(source  && { source }),
      ...(status  && { status }),
      ...(country && { country }),
      page: String(p),
    });
    return `/admin/logs?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Policy Activity Log"
        description={`${total.toLocaleString()} entries${source || status || country ? " (filtered)" : ""} · ${totalCount.toLocaleString()} total`}
      />

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Snapshots", value: totalCount, cls: "text-slate-900" },
          { label: "Manual Edits",    value: manualCount, cls: "text-indigo-700" },
          { label: "Auto Refreshes",  value: autoCount,   cls: "text-sky-700" },
          { label: "Pending Review",  value: pendingCount, cls: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className={`mt-1 text-2xl font-black ${s.cls}`}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {/* Country search */}
        <form method="GET" action="/admin/logs" className="flex">
          <input
            name="country"
            defaultValue={country}
            placeholder="Filter by country…"
            className="h-8 rounded-l-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none w-44"
          />
          {source && <input type="hidden" name="source" value={source} />}
          {status && <input type="hidden" name="status" value={status} />}
          <button type="submit" className="h-8 rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100">
            Search
          </button>
        </form>

        {/* Source filter */}
        <div className="flex gap-1">
          {[
            { value: "", label: "All sources" },
            { value: "manual_edit", label: "Manual" },
            { value: "auto_refresh", label: "Auto refresh" },
            { value: "initial", label: "Initial" },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={filterUrl({ source: opt.value, ...(opt.value === "" ? { source: "" } : {}) })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                source === opt.value
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1">
          {[
            { value: "", label: "All statuses" },
            { value: "approved", label: "Approved" },
            { value: "pending_review", label: "Pending" },
            { value: "rejected", label: "Rejected" },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={filterUrl({ status: opt.value })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === opt.value
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Clear filters */}
        {(source || status || country) && (
          <Link href="/admin/logs" className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2">
            Clear filters
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Time (IST)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Country</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Visa Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Version</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Change Types</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {snapshots.map((snap) => {
              const src = SOURCE_LABELS[snap.changeSource] ?? { label: snap.changeSource, cls: "bg-slate-100 text-slate-500" };
              const sts = STATUS_LABELS[snap.status] ?? { label: snap.status, cls: "bg-slate-100 text-slate-500" };
              const country = snap.policy.country;
              return (
                <tr key={snap.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(snap.createdAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/logs?country=${encodeURIComponent(country.name)}`}
                      className="text-xs font-medium text-slate-800 hover:text-indigo-700"
                    >
                      {country.name}
                    </Link>
                    <p className="text-[10px] font-mono text-slate-400">{country.code}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 capitalize">
                    {snap.policy.visaType.charAt(0) + snap.policy.visaType.slice(1).toLowerCase()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    v{snap.versionNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${src.cls}`}>
                      {src.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sts.cls}`}>
                      {sts.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(snap.changeTypes ?? []).map((ct: string) => (
                        <span key={ct} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                          {ct.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/policy/${country.code.toLowerCase()}/${snap.policy.visaType.toLowerCase()}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                    >
                      View policy →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {snapshots.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-400">
            No activity found{source || status || country ? " for these filters" : ""}.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <p>
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
          </p>
          <div className="flex gap-1">
            {page > 1 && (
              <Link href={pageUrl(page - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50">
                ← Prev
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = page <= 4 ? i + 1 : page - 3 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <Link
                  key={p}
                  href={pageUrl(p)}
                  className={`rounded-lg border px-3 py-1.5 font-medium transition-colors ${
                    p === page
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link href={pageUrl(page + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
