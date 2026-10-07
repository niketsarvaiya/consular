"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2, Search, UserCheck } from "lucide-react";

interface Agent {
  id: string; email: string; fullName: string; agencyName: string | null;
  isAgent: boolean; coinBalance: number; applications: number;
  ledger: { id: string; delta: number; balanceAfter: number; reason: string; note: string | null; createdAt: string }[];
}

const REASON_LABEL: Record<string, string> = {
  purchase: "Bought coins",
  application_payment: "Application paid",
  admin_credit: "Manual credit",
  admin_debit: "Manual debit",
  refund: "Refund",
};

export function AgentsManager({ agents, others }: { agents: Agent[]; others: Agent[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [amount, setAmount] = useState<Record<string, string>>({});
  const [note, setNote] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");

  const post = async (body: Record<string, unknown>) => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
    finally { setBusy(false); }
  };

  const adjust = (id: string, sign: 1 | -1) => {
    const n = parseInt(amount[id] ?? "", 10);
    if (!n || n <= 0) { setError("Enter a number of coins."); return; }
    post({ customerId: id, action: "adjust_coins", coins: sign * n, note: note[id] || undefined });
    setAmount((a) => ({ ...a, [id]: "" })); setNote((x) => ({ ...x, [id]: "" }));
  };

  const matches = others.filter((c) =>
    q.length >= 2 && (c.email.toLowerCase().includes(q.toLowerCase()) || c.fullName.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Promote a customer */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Make a customer an agent</h2>
        <p className="mt-0.5 text-xs text-slate-500">Agent accounts get a coin wallet and pay for applications from it.</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…"
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-iris-400" />
          </div>
        </div>
        {q.length >= 2 && (
          <div className="mt-3 space-y-1">
            {matches.length === 0 && <p className="text-xs text-slate-400">No matching customers.</p>}
            {matches.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{c.fullName}</p>
                  <p className="truncate text-xs text-slate-400">{c.email}</p>
                </div>
                <button type="button" disabled={busy} onClick={() => post({ customerId: c.id, action: "set_agent", isAgent: true })}
                  className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
                  Make agent
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent wallets */}
      {agents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          No agents yet. Search above to promote a customer.
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-iris-600" />
                    <p className="truncate text-sm font-bold text-slate-900">{a.agencyName || a.fullName}</p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{a.fullName} · {a.email} · {a.applications} applications</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1.5 text-2xl font-black text-slate-900">
                    <Coins className="h-5 w-5 text-amber-500" />
                    {a.coinBalance.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-slate-400">≈ ₹{a.coinBalance.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <label htmlFor={`c${a.id}`} className="sr-only">Coins</label>
                <input id={`c${a.id}`} type="number" min={1} value={amount[a.id] ?? ""} placeholder="Coins"
                  onChange={(e) => setAmount((x) => ({ ...x, [a.id]: e.target.value }))}
                  className="w-28 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-iris-400" />
                <label htmlFor={`n${a.id}`} className="sr-only">Reference</label>
                <input id={`n${a.id}`} value={note[a.id] ?? ""} placeholder="Reference (e.g. NEFT 4821)"
                  onChange={(e) => setNote((x) => ({ ...x, [a.id]: e.target.value }))}
                  className="flex-1 min-w-[160px] rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-iris-400" />
                <button type="button" disabled={busy} onClick={() => adjust(a.id, 1)}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Credit"}
                </button>
                <button type="button" disabled={busy} onClick={() => adjust(a.id, -1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  Debit
                </button>
                <button type="button" onClick={() => setOpen(open === a.id ? null : a.id)}
                  className="ml-auto text-xs font-semibold text-iris-600 hover:underline">
                  {open === a.id ? "Hide history" : "History"}
                </button>
                <button type="button" disabled={busy} onClick={() => post({ customerId: a.id, action: "set_agent", isAgent: false })}
                  className="text-xs text-slate-400 hover:text-red-600">Remove agent</button>
              </div>

              {open === a.id && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  {a.ledger.length === 0 ? (
                    <p className="text-xs text-slate-400">No coin movements yet.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                          <th className="pb-1.5">When</th><th className="pb-1.5">What</th>
                          <th className="pb-1.5 text-right">Change</th><th className="pb-1.5 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {a.ledger.map((l) => (
                          <tr key={l.id}>
                            <td className="py-1.5 text-slate-400">
                              {new Date(l.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="py-1.5 text-slate-600">
                              {REASON_LABEL[l.reason] ?? l.reason}{l.note ? ` · ${l.note}` : ""}
                            </td>
                            <td className={`py-1.5 text-right font-semibold ${l.delta > 0 ? "text-emerald-600" : "text-slate-700"}`}>
                              {l.delta > 0 ? "+" : ""}{l.delta.toLocaleString("en-IN")}
                            </td>
                            <td className="py-1.5 text-right text-slate-400">{l.balanceAfter.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
