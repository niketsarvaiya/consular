"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2, Plus } from "lucide-react";

declare global {
  interface Window { Razorpay: new (options: Record<string, unknown>) => { open(): void } }
}

interface Entry { id: string; delta: number; balanceAfter: number; reason: string; note: string | null; createdAt: string }

const REASON_LABEL: Record<string, string> = {
  purchase: "Bought coins",
  application_payment: "Application payment",
  admin_credit: "Credited by VisaSetGo",
  admin_debit: "Adjustment",
  refund: "Refund",
};

const PACKS = [5000, 10000, 25000, 50000];

export function WalletClient({ balance, agencyName, ledger }: {
  balance: number; agencyName: string | null; ledger: Entry[];
}) {
  const router = useRouter();
  const [coins, setCoins] = useState(10000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);

  const buy = async () => {
    setBusy(true); setError(""); setOk("");
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coins }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not start the purchase.");
      const d = data.data;

      const rzp = new window.Razorpay({
        key: d.keyId, amount: d.amount, currency: d.currency, order_id: d.orderId,
        name: "VisaSetGo", description: `${d.coins.toLocaleString("en-IN")} coins`,
        prefill: { name: d.customerName, email: d.customerEmail },
        theme: { color: "#16181D" },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/wallet/verify", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r),
          });
          const vd = await v.json();
          setBusy(false);
          if (v.ok && vd.success) {
            setOk(`${vd.data.coins.toLocaleString("en-IN")} coins added. New balance ${vd.data.balance.toLocaleString("en-IN")}.`);
            router.refresh();
          } else {
            setError(vd.error || "We couldn't confirm that payment. If money was debited, contact support.");
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance */}
      <div className="rounded-3xl bg-sunset p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
          {agencyName ?? "Agent wallet"}
        </p>
        <p className="mt-3 flex items-center gap-3 font-display text-5xl font-black tabular-nums">
          <Coins className="h-9 w-9" /> {balance.toLocaleString("en-IN")}
        </p>
        <p className="mt-1 text-sm text-white/80">coins · worth ₹{balance.toLocaleString("en-IN")}</p>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</p>}

      {/* Top up */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-ink">Top up</h2>
        <p className="mt-0.5 text-xs text-slate-500">1 coin = ₹1. Coins never expire and apply to any destination.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PACKS.map((p) => (
            <button key={p} type="button" onClick={() => setCoins(p)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                coins === p ? "border-ink bg-ink text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {p.toLocaleString("en-IN")}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="coins" className="mb-1.5 block text-xs font-semibold text-slate-600">Or enter an amount</label>
            <input id="coins" type="number" min={5000} step={1000} value={coins}
              onChange={(e) => setCoins(Math.max(0, parseInt(e.target.value || "0", 10)))}
              className="w-40 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-iris" />
          </div>
          <button type="button" onClick={buy} disabled={busy || coins < 5000}
            className="flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-bold text-white hover:bg-ink-700 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Pay ₹{coins.toLocaleString("en-IN")}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">Minimum 5,000 coins. Paying by bank transfer? Send us the reference and we&apos;ll credit it.</p>
      </div>

      {/* History */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-ink">Coin history</h2>
        {ledger.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing yet. Top up to get started.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-2 pb-2">When</th><th className="px-2 pb-2">What</th>
                  <th className="px-2 pb-2 text-right">Change</th><th className="px-2 pb-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ledger.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap px-2 py-2.5 text-xs text-slate-400">
                      {new Date(l.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-2 py-2.5 text-slate-700">
                      {REASON_LABEL[l.reason] ?? l.reason}
                      {l.note && <span className="block text-xs text-slate-400">{l.note}</span>}
                    </td>
                    <td className={`px-2 py-2.5 text-right font-semibold tabular-nums ${l.delta > 0 ? "text-emerald-600" : "text-slate-800"}`}>
                      {l.delta > 0 ? "+" : ""}{l.delta.toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-slate-400">{l.balanceAfter.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
