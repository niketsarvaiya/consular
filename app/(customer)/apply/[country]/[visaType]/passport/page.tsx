"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
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
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/destinations" className="hover:text-slate-600">Destinations</Link>
        <span>/</span>
        <span className="uppercase">{params.country}</span>
        <span>/</span>
        <span className="capitalize">{params.visaType} Visa</span>
        <span>/</span>
        <span>Passport details</span>
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Passport details</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your passport details exactly as printed. This is used for your visa application.</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">

        {/* Use saved passport option */}
        {saved && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Use saved passport</p>
                <p className="mt-0.5 text-xs text-slate-500">{saved.fullName} · Expires {toDateInput(saved.expiryDate)}</p>
              </div>
              <button
                type="button"
                onClick={() => setUseSaved(!useSaved)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${useSaved ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {useSaved ? "Selected" : "Use this"}
              </button>
            </div>
            {useSaved && (
              <button type="button" onClick={() => setUseSaved(false)} className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline">
                Enter different passport details
              </button>
            )}
          </div>
        )}

        {/* Passport form — shown when no saved passport or user wants to enter new */}
        {!useSaved && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Passport information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name (as on passport)</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
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
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase tracking-widest outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="A1234567"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="X">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date of birth</label>
                <input
                  type="date"
                  required
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Passport expiry date</label>
                <input
                  type="date"
                  required
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Issue date <span className="text-slate-400">(optional)</span></label>
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Place of issue <span className="text-slate-400">(optional)</span></label>
                <input
                  type="text"
                  value={form.issuePlace}
                  onChange={(e) => setForm({ ...form, issuePlace: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Mumbai RPO"
                />
              </div>
            </div>
          </div>
        )}

        {/* Travel dates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Travel dates <span className="text-slate-400 font-normal">(optional)</span></h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Departure date</label>
              <input
                type="date"
                value={form.travelDateFrom}
                onChange={(e) => setForm({ ...form, travelDateFrom: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Return date</label>
              <input
                type="date"
                value={form.travelDateTo}
                onChange={(e) => setForm({ ...form, travelDateTo: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Purpose of travel <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={form.purposeNotes}
              onChange={(e) => setForm({ ...form, purposeNotes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
              placeholder="e.g. Family vacation, business meetings..."
              maxLength={500}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creating application…</>
          ) : (
            <>Continue to checklist <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
    </div>
  );
}
