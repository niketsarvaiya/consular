"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowRight, CheckCircle2, FileText, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";

interface SavedPassport {
  id: string;
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  expiryDate: string;
  issueDate?: string;
  issuePlace?: string;
  gender?: string;
}

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

export default function PassportStepPage() {
  const router = useRouter();
  const params = useParams<{ country: string; visaType: string }>();

  const [saved, setSaved] = useState<SavedPassport | null>(null);
  const [useSaved, setUseSaved] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    passportNumber: "",
    dateOfBirth: "",
    expiryDate: "",
    issueDate: "",
    issuePlace: "",
    gender: "",
    nationality: "IND",
    travelDateFrom: "",
    travelDateTo: "",
    purposeNotes: "",
  });

  useEffect(() => {
    fetch("/api/passports")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSaved(data.data);
          setUseSaved(true);
        }
      })
      .finally(() => setLoadingSaved(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let passportId: string;

      if (useSaved && saved) {
        passportId = saved.id;
      } else {
        const pRes = await fetch("/api/passports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName.toUpperCase(),
            passportNumber: form.passportNumber.toUpperCase(),
            dateOfBirth: new Date(form.dateOfBirth).toISOString(),
            expiryDate: new Date(form.expiryDate).toISOString(),
            issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : undefined,
            issuePlace: form.issuePlace || undefined,
            gender: form.gender || undefined,
            nationality: form.nationality,
          }),
        });
        const pData = await pRes.json();
        if (!pRes.ok) {
          setError(typeof pData.error === "object" ? "Please check the form fields." : (pData.error ?? "Failed to save passport."));
          setSubmitting(false);
          return;
        }
        passportId = pData.data.passportId;
      }

      // Fetch countryId from code
      const destRes = await fetch("/api/destinations");
      const destData = await destRes.json();
      const country = destData.data?.find((c: { code: string; id: string }) => c.code === params.country.toUpperCase());
      if (!country) {
        setError("Country not found.");
        setSubmitting(false);
        return;
      }

      const appRes = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryId: country.id,
          visaType: params.visaType.toUpperCase(),
          passportId,
          travelDateFrom: form.travelDateFrom ? new Date(form.travelDateFrom).toISOString() : undefined,
          travelDateTo: form.travelDateTo ? new Date(form.travelDateTo).toISOString() : undefined,
          purposeNotes: form.purposeNotes || undefined,
        }),
      });

      const appData = await appRes.json();
      if (!appRes.ok) {
        setError(appData.error ?? "Failed to create application.");
        setSubmitting(false);
        return;
      }

      router.push(`/dashboard/application/${appData.data.applicationId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadingSaved) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Progress bar header */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
            <Link href="/destinations" className="hover:text-slate-600">Destinations</Link>
            <span>/</span>
            <span className="uppercase">{params.country}</span>
            <span>/</span>
            <span className="capitalize">{params.visaType} Visa</span>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {[
              { icon: FileText, label: "Passport" },
              { icon: CheckCircle2, label: "Documents" },
              { icon: CreditCard, label: "Payment" },
              { icon: CalendarDays, label: "Done" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                    {i === 0 ? <step.icon className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i === 0 ? "text-indigo-600" : "text-slate-400"}`}>{step.label}</span>
                </div>
                {i < 3 && <div className="mx-3 h-px w-8 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Passport details</h1>
          <p className="mt-1 text-sm text-slate-500">Enter exactly as printed on your passport. Your data is encrypted and stored securely.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Saved passport card */}
          {saved && (
            <div className={`rounded-2xl border-2 p-5 transition-colors ${useSaved ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {useSaved && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                    <p className="text-sm font-semibold text-slate-900">Use saved passport</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-mono">{saved.fullName}</p>
                  <p className="text-xs text-slate-400">Expires {toDateInput(saved.expiryDate)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseSaved(!useSaved)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${useSaved ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  {useSaved ? "Selected ✓" : "Use this"}
                </button>
              </div>
              {useSaved && (
                <button type="button" onClick={() => setUseSaved(false)} className="mt-3 text-xs text-indigo-500 hover:text-indigo-700 underline">
                  Enter different passport details instead
                </button>
              )}
            </div>
          )}

          {/* Passport form */}
          {!useSaved && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Passport information</h2>
              <p className="text-xs text-slate-400 -mt-2">All fields must match exactly as printed on your passport.</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name <span className="text-slate-400 font-normal">as on passport</span></label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className={`${inputCls} uppercase tracking-wide`}
                    placeholder="SHARMA RAHUL KUMAR"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Passport number</label>
                  <input
                    type="text"
                    required
                    value={form.passportNumber}
                    onChange={(e) => setForm({ ...form, passportNumber: e.target.value.toUpperCase() })}
                    className={`${inputCls} uppercase tracking-widest font-mono`}
                    placeholder="A1234567"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="X">Other / Unspecified</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Date of birth</label>
                  <input type="date" required value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inputCls} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Passport expiry date</label>
                  <input type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className={inputCls} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Issue date <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className={inputCls} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Place of issue <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={form.issuePlace}
                    onChange={(e) => setForm({ ...form, issuePlace: e.target.value })}
                    className={inputCls}
                    placeholder="Mumbai RPO"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Travel dates */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Travel dates <span className="text-slate-400 font-normal">(optional)</span></h2>
              <p className="mt-0.5 text-xs text-slate-400">Helps us process your application faster.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Departure date</label>
                <input type="date" value={form.travelDateFrom} onChange={(e) => setForm({ ...form, travelDateFrom: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Return date</label>
                <input type="date" value={form.travelDateTo} onChange={(e) => setForm({ ...form, travelDateTo: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Purpose of travel <span className="text-slate-400 font-normal">(optional)</span></label>
              <textarea
                value={form.purposeNotes}
                onChange={(e) => setForm({ ...form, purposeNotes: e.target.value })}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="e.g. Family vacation, business meetings..."
                maxLength={500}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating your application…</>
            ) : (
              <>Continue to document checklist <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
          <p className="text-center text-xs text-slate-400">Your data is encrypted with AES-256. We never share your documents without consent.</p>
        </form>
      </div>
    </div>
  );
}
