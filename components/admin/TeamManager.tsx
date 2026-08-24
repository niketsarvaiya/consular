"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Shield, User, X } from "lucide-react";

interface Country { id: string; name: string; code: string }
interface Member {
  id: string; email: string; fullName: string; role: string; isActive: boolean;
  countries: { id: string; name: string; code: string }[];
}

const ROLES = [
  { value: "OPS", label: "Agent — processes assigned countries" },
  { value: "VIEWER", label: "Viewer — read only" },
  { value: "ADMIN", label: "Super admin — full access, all countries" },
];

export function TeamManager({ members, countries, currentUserId }: {
  members: Member[]; countries: Country[]; currentUserId: string;
}) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "OPS", countryIds: [] as string[] });

  const create = async () => {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(typeof data.error === "string" ? data.error : "Could not create user.");
      setShowNew(false);
      setForm({ fullName: "", email: "", password: "", role: "OPS", countryIds: [] });
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
    finally { setBusy(false); }
  };

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(typeof data.error === "string" ? data.error : "Update failed.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
    finally { setBusy(false); }
  };

  return (
    <div>
      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowNew((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Add agent
        </button>
      </div>

      {showNew && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-ink">New team member</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-iris-400" />
            <input type="email" placeholder="email@visasetgo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-iris-400" />
            <input type="password" placeholder="Temporary password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-iris-400" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-iris-400">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {form.role !== "ADMIN" && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-slate-600">Assign destinations ({form.countryIds.length} selected)</p>
              <CountryPicker countries={countries} selected={form.countryIds}
                onToggle={(id) => setForm((f) => ({ ...f, countryIds: f.countryIds.includes(id) ? f.countryIds.filter((x) => x !== id) : [...f.countryIds, id] }))} />
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setShowNew(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button onClick={create} disabled={busy || !form.email || !form.fullName || form.password.length < 8}
              className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                  {m.role === "ADMIN" ? <Shield className="h-4 w-4 text-iris-600" /> : <User className="h-4 w-4 text-slate-400" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {m.fullName}{m.id === currentUserId && <span className="ml-2 text-[10px] text-slate-400">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select value={m.role} disabled={busy || m.id === currentUserId}
                  onChange={(e) => patch(m.id, { role: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs disabled:opacity-60">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.value}</option>)}
                </select>
                <button type="button" disabled={busy || m.id === currentUserId}
                  onClick={() => patch(m.id, { isActive: !m.isActive })}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium disabled:opacity-60 ${m.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {m.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            {m.role !== "ADMIN" && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Destinations:</span>
                  {m.countries.length === 0
                    ? <span className="text-xs text-amber-600">None assigned — sees no cases</span>
                    : m.countries.map((c) => (
                        <span key={c.id} className="rounded-full bg-iris-50 px-2 py-0.5 text-[11px] font-medium text-iris-700">{c.name}</span>
                      ))}
                  <button type="button" onClick={() => setEditing(editing === m.id ? null : m.id)}
                    className="ml-auto text-xs font-semibold text-iris-600 hover:text-iris-800">
                    {editing === m.id ? "Done" : "Edit"}
                  </button>
                </div>
                {editing === m.id && (
                  <div className="mt-3">
                    <CountryPicker countries={countries} selected={m.countries.map((c) => c.id)}
                      onToggle={(id) => {
                        const ids = m.countries.map((c) => c.id);
                        patch(m.id, { countryIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] });
                      }} />
                  </div>
                )}
              </div>
            )}
            {m.role === "ADMIN" && <p className="mt-2 text-xs text-slate-400">Super admin — access to all destinations.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CountryPicker({ countries, selected, onToggle }: {
  countries: Country[]; selected: string[]; onToggle: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const list = q ? countries.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : countries;
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search destinations…"
        className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-iris-400" />
      <div className="flex max-h-44 flex-wrap gap-1.5 overflow-auto">
        {list.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button key={c.id} type="button" onClick={() => onToggle(c.id)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${on ? "border-iris-300 bg-iris-50 text-iris-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {c.name}{on && <X className="h-3 w-3" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
