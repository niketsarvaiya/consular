"use client";
import { useState } from "react";
import { Mail, Clock, MessageCircle, Phone, CheckCircle } from "lucide-react";

const TOPICS = [
  "Application status",
  "Document guidance",
  "Fee & payment",
  "Visa rejection help",
  "Account or login issue",
  "Something else",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production this would POST to an API route
    setSubmitted(true);
  }

  return (
    <div className="bg-white">

      {/* ── HEADER ── */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Get in touch</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">How can we help?</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Our team responds to every message. Whether you have a question about your application, a document query, or just need guidance — we&apos;re here.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">

          {/* ── LEFT — Contact info ── */}
          <div className="lg:col-span-2 space-y-6">

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Email us</h3>
              <p className="mt-1 text-sm text-slate-500">For all enquiries, applications, and document questions.</p>
              <a href="mailto:support@consular.in" className="mt-2 block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                support@consular.in
              </a>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Response time</h3>
              <p className="mt-1 text-sm text-slate-500">
                We reply within <span className="font-semibold text-slate-800">2 hours</span> during business hours (Mon–Sat, 9am–8pm IST).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <MessageCircle className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900">WhatsApp</h3>
              <p className="mt-1 text-sm text-slate-500">Quick questions? Ping us on WhatsApp for faster responses.</p>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm font-semibold text-violet-600 hover:text-violet-700">
                Open WhatsApp chat →
              </a>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Phone className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Phone</h3>
              <p className="mt-1 text-sm text-slate-500">For urgent matters only. Mon–Fri, 10am–6pm IST.</p>
              <a href="tel:+919999999999" className="mt-2 block text-sm font-semibold text-amber-600 hover:text-amber-700">
                +91 99999 99999
              </a>
            </div>

          </div>

          {/* ── RIGHT — Form ── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-emerald-50 px-8 py-16 text-center">
                <CheckCircle className="mb-4 h-12 w-12 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Message received!</h2>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  We&apos;ll get back to you at <strong>{form.email}</strong> within 2 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: "", message: "" }); }}
                  className="mt-6 rounded-xl border border-emerald-200 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Full name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Priya Sharma"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="priya@example.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Topic</label>
                  <select
                    required
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                  >
                    <option value="">Select a topic…</option>
                    {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what you need help with…"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700"
                >
                  Send message
                </button>

                <p className="text-center text-xs text-slate-400">
                  We respond within 2 hours · Mon–Sat, 9am–8pm IST
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
