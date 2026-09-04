"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Copy, Printer, FileDown, Check } from "lucide-react";

const EMPLOYMENT = ["Salaried", "Business Owner/Self-Employed", "Student", "Retired", "Unemployed", "Dependent (Minor)"];
const PURPOSES = ["TOURISM", "BUSINESS", "FAMILY VISIT", "TRANSIT", "OTHER"];

type Companion = { full_name: string; passport_number: string; relationship: string };
type Traveler = {
  full_name: string; passport_number: string; address: string; relationship: string;
  is_minor: boolean; guardian_full_name: string; guardian_passport_number: string;
  employment_type: string; employer_or_business_name: string; designation_or_field: string;
  funding_type: string; sponsor_full_name: string; sponsor_relationship: string;
};
type Letter = { traveler: string; letter_markdown: string };

const blankTraveler = (): Traveler => ({
  full_name: "", passport_number: "", address: "", relationship: "",
  is_minor: false, guardian_full_name: "", guardian_passport_number: "",
  employment_type: "Salaried", employer_or_business_name: "", designation_or_field: "",
  funding_type: "Self-funded", sponsor_full_name: "", sponsor_relationship: "",
});

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-iris";
const label = "mb-1 block text-xs font-semibold text-slate-600";

export function CoverLetterTool() {
  const [destination, setDestination] = useState("");
  const [visaType, setVisaType] = useState("");
  const [purpose, setPurpose] = useState("TOURISM");
  const [departure, setDeparture] = useState("");
  const [ret, setRet] = useState("");
  const [embassy, setEmbassy] = useState("");
  const [notes, setNotes] = useState("");
  const [itinerary, setItinerary] = useState<{ date_range: string; location: string }[]>([]);
  const [travelers, setTravelers] = useState<Traveler[]>([blankTraveler()]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const setT = (i: number, patch: Partial<Traveler>) =>
    setTravelers((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  const ready = destination && visaType && departure && ret &&
    travelers.every((t) => t.full_name.trim() && t.passport_number.trim());

  const generate = async () => {
    setBusy(true); setError(""); setLetters([]);
    try {
      const payload = {
        destination_country: destination,
        visa_type: visaType,
        visa_purpose: purpose,
        travel_dates: { departure, return: ret },
        itinerary: itinerary.filter((r) => r.date_range && r.location),
        embassy_or_consulate: embassy || null,
        additional_notes: notes || null,
        // Everyone else on the trip is this traveler's companion.
        travelers: travelers.map((t, i) => ({
          full_name: t.full_name,
          passport_number: t.passport_number,
          address: t.address || null,
          is_minor: t.is_minor,
          guardian_full_name: t.guardian_full_name || null,
          guardian_passport_number: t.guardian_passport_number || null,
          employment_type: t.employment_type,
          employer_or_business_name: t.employer_or_business_name || null,
          designation_or_field: t.designation_or_field || null,
          funding: {
            type: t.funding_type,
            sponsor_full_name: t.sponsor_full_name || null,
            sponsor_relationship: t.sponsor_relationship || null,
          },
          companions: travelers
            .filter((_, j) => j !== i)
            .map((c) => ({ full_name: c.full_name, passport_number: c.passport_number, relationship: c.relationship })),
        })),
      };
      const res = await fetch("/api/tools/cover-letter", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Generation failed.");
      setLetters(data.data.letters); setActive(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  };

  const current = letters[active];
  const html = useMemo(() => (current ? mdToHtml(current.letter_markdown) : ""), [current]);

  const copy = async () => {
    if (!current) return;
    await navigator.clipboard.writeText(current.letter_markdown);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const downloadDoc = () => {
    if (!current) return;
    const blob = new Blob(
      [`<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body style="font-family:Calibri,serif;font-size:11pt">${html}</body></html>`],
      { type: "application/msword" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Cover Letter - ${current.traveler}.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── Form ── */}
      <div className="space-y-5 print:hidden">
        <Card title="Trip basics">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="cl-dest">Destination country *</label>
              <input id="cl-dest" className={input} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Turkey, France" />
            </div>
            <div>
              <label className={label} htmlFor="cl-type">Visa type *</label>
              <input id="cl-type" className={input} value={visaType} onChange={(e) => setVisaType(e.target.value)} placeholder="e.g. Turkey Tourist Visa" />
            </div>
            <div>
              <label className={label} htmlFor="cl-purpose">Purpose</label>
              <select id="cl-purpose" className={input} value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="cl-embassy">Embassy / consulate</label>
              <input id="cl-embassy" className={input} value={embassy} onChange={(e) => setEmbassy(e.target.value)} placeholder="e.g. Consulate General of France" />
            </div>
            <div>
              <label className={label} htmlFor="cl-dep">Departure *</label>
              <input id="cl-dep" type="date" className={input} value={departure} onChange={(e) => setDeparture(e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="cl-ret">Return *</label>
              <input id="cl-ret" type="date" className={input} value={ret} onChange={(e) => setRet(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card title="Itinerary" action={
          <button type="button" onClick={() => setItinerary((r) => [...r, { date_range: "", location: "" }])}
            className="flex items-center gap-1 text-xs font-semibold text-iris hover:text-iris-700">
            <Plus className="h-3.5 w-3.5" /> Add stop
          </button>
        }>
          {itinerary.length === 0 && <p className="text-sm text-slate-400">Optional. Without stops the letter says “itinerary to be provided”.</p>}
          <div className="space-y-2">
            {itinerary.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input className={input} value={row.date_range} placeholder="10/11/2026 - 13/11/2026"
                  onChange={(e) => setItinerary((r) => r.map((x, j) => j === i ? { ...x, date_range: e.target.value } : x))} />
                <input className={input} value={row.location} placeholder="Paris"
                  onChange={(e) => setItinerary((r) => r.map((x, j) => j === i ? { ...x, location: e.target.value } : x))} />
                <button type="button" aria-label="Remove stop" onClick={() => setItinerary((r) => r.filter((_, j) => j !== i))}
                  className="shrink-0 rounded-xl border border-slate-200 px-2.5 text-slate-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Travellers" action={
          <button type="button" onClick={() => setTravelers((t) => [...t, blankTraveler()])}
            className="flex items-center gap-1 text-xs font-semibold text-iris hover:text-iris-700">
            <Plus className="h-3.5 w-3.5" /> Add traveller
          </button>
        }>
          <p className="mb-3 text-xs text-slate-500">Each traveller gets their own signed letter — never a combined family letter.</p>
          <div className="space-y-4">
            {travelers.map((t, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Traveller {i + 1}</p>
                  {travelers.length > 1 && (
                    <button type="button" onClick={() => setTravelers((ts) => ts.filter((_, j) => j !== i))}
                      className="text-xs text-slate-400 hover:text-red-600">Remove</button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor={`n${i}`}>Full name (as on passport) *</label>
                    <input id={`n${i}`} className={input} value={t.full_name} onChange={(e) => setT(i, { full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className={label} htmlFor={`p${i}`}>Passport number *</label>
                    <input id={`p${i}`} className={input} value={t.passport_number} onChange={(e) => setT(i, { passport_number: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={label} htmlFor={`a${i}`}>Address</label>
                    <input id={`a${i}`} className={input} value={t.address} onChange={(e) => setT(i, { address: e.target.value })} />
                  </div>
                  {travelers.length > 1 && (
                    <div className="sm:col-span-2">
                      <label className={label} htmlFor={`r${i}`}>Others refer to this person as their…</label>
                      <input id={`r${i}`} className={input} value={t.relationship} placeholder="wife / son / friend"
                        onChange={(e) => setT(i, { relationship: e.target.value })} />
                    </div>
                  )}
                  <div>
                    <label className={label} htmlFor={`e${i}`}>Employment</label>
                    <select id={`e${i}`} className={input} value={t.employment_type}
                      onChange={(e) => setT(i, { employment_type: e.target.value, is_minor: e.target.value === "Dependent (Minor)" })}>
                      {EMPLOYMENT.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={label} htmlFor={`f${i}`}>Funding</label>
                    <select id={`f${i}`} className={input} value={t.funding_type} onChange={(e) => setT(i, { funding_type: e.target.value })}>
                      <option>Self-funded</option><option>Sponsored</option>
                    </select>
                  </div>
                  {t.funding_type === "Self-funded" && t.employment_type !== "Retired" && (
                    <>
                      <div>
                        <label className={label} htmlFor={`emp${i}`}>Employer / business</label>
                        <input id={`emp${i}`} className={input} value={t.employer_or_business_name} onChange={(e) => setT(i, { employer_or_business_name: e.target.value })} />
                      </div>
                      <div>
                        <label className={label} htmlFor={`d${i}`}>Designation / field</label>
                        <input id={`d${i}`} className={input} value={t.designation_or_field} onChange={(e) => setT(i, { designation_or_field: e.target.value })} />
                      </div>
                    </>
                  )}
                  {t.funding_type === "Sponsored" && (
                    <>
                      <div>
                        <label className={label} htmlFor={`sn${i}`}>Sponsor name</label>
                        <input id={`sn${i}`} className={input} value={t.sponsor_full_name} onChange={(e) => setT(i, { sponsor_full_name: e.target.value })} />
                      </div>
                      <div>
                        <label className={label} htmlFor={`sr${i}`}>Sponsor is their…</label>
                        <input id={`sr${i}`} className={input} value={t.sponsor_relationship} placeholder="husband / father" onChange={(e) => setT(i, { sponsor_relationship: e.target.value })} />
                      </div>
                    </>
                  )}
                  {t.is_minor && (
                    <>
                      <div>
                        <label className={label} htmlFor={`gn${i}`}>Guardian name</label>
                        <input id={`gn${i}`} className={input} value={t.guardian_full_name} onChange={(e) => setT(i, { guardian_full_name: e.target.value })} />
                      </div>
                      <div>
                        <label className={label} htmlFor={`gp${i}`}>Guardian passport no.</label>
                        <input id={`gp${i}`} className={input} value={t.guardian_passport_number} onChange={(e) => setT(i, { guardian_passport_number: e.target.value })} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Anything else the consulate should know?">
          <textarea rows={3} className={input} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional — e.g. insurance policy details, prior refusals, conference invitation." />
        </Card>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button type="button" onClick={generate} disabled={!ready || busy}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sunset px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-opacity disabled:opacity-40">
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Drafting letters…</> : `Generate ${travelers.length} letter${travelers.length > 1 ? "s" : ""}`}
        </button>
      </div>

      {/* ── Preview ── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3 print:hidden">
            {letters.map((l, i) => (
              <button key={i} type="button" onClick={() => setActive(i)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${i === active ? "bg-ink text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {l.traveler}
              </button>
            ))}
            {letters.length > 0 && (
              <div className="ml-auto flex gap-1.5">
                <IconBtn onClick={copy} label="Copy">{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}</IconBtn>
                <IconBtn onClick={() => window.print()} label="Print / save as PDF"><Printer className="h-4 w-4" /></IconBtn>
                <IconBtn onClick={downloadDoc} label="Download as Word"><FileDown className="h-4 w-4" /></IconBtn>
              </div>
            )}
          </div>

          <div className="min-h-[420px] p-6 sm:p-8">
            {busy && <p className="py-24 text-center text-sm text-slate-400">Drafting…</p>}
            {!busy && letters.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-sm font-semibold text-slate-700">Your letters will appear here</p>
                <p className="mt-1 text-sm text-slate-400">Fill in the trip and traveller details, then generate.</p>
              </div>
            )}
            {current && (
              <article className="cover-letter text-[13.5px] leading-relaxed text-slate-800"
                dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>
        </div>
        {letters.length > 0 && (
          <p className="mt-3 text-xs text-slate-400 print:hidden">
            Anything in [SQUARE BRACKETS] still needs to be filled in before you submit.
          </p>
        )}
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label}
      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-ink">
      {children}
    </button>
  );
}

/**
 * Minimal Markdown renderer for the constrained letter output
 * (bold, pipe tables, bullets, paragraphs, and the ::center:: header marker).
 * ponytail: subset only — swap in a real markdown lib if letters ever need links/headings.
 */
function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]/g, '<mark class="bg-amber-100 text-amber-900 rounded px-1">[$1]</mark>');

  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0, centered = false;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (t === "::center::") { centered = true; out.push('<div style="text-align:center">'); i++; continue; }
    if (t === "::/center::") { centered = false; out.push("</div>"); i++; continue; }
    if (!t) { i++; continue; }

    // Table
    if (t.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^-{2,}$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        '<table class="my-3 w-full border-collapse text-left text-[13px]"><thead><tr>' +
        head.map((c) => `<th class="border border-slate-300 px-2 py-1 font-semibold">${inline(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        body.map((r) => "<tr>" + r.map((c) => `<td class="border border-slate-300 px-2 py-1">${inline(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>"
      );
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^[-*]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul class="my-3 list-disc space-y-0.5 pl-5">${items.join("")}</ul>`);
      continue;
    }

    out.push(`<p class="my-2"${centered ? ' style="margin:0"' : ""}>${inline(t)}</p>`);
    i++;
  }
  return out.join("");
}
