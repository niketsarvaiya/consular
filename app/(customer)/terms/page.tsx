import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

const UPDATED = "July 2026";

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-iris-500">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {UPDATED}</p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This is a working template and must be reviewed by legal counsel before launch.
        </div>

        <div className="mt-8 max-w-none space-y-8 text-sm leading-relaxed text-slate-600">
          <Section title="1. What we do">
            VisaSetGo helps Indian passport holders prepare and submit visa
            applications. We provide document checklists, review, and submission
            assistance. We are a facilitation service, not a government body.
          </Section>
          <Section title="2. No guarantee of approval">
            Visa approval is at the sole discretion of the respective embassy or
            government authority. We do not and cannot guarantee that any visa will
            be granted. Government fees are non-refundable regardless of outcome.
          </Section>
          <Section title="3. Your responsibilities">
            You agree to provide accurate, genuine documents and information. You
            are responsible for the authenticity of everything you upload.
            Submitting forged or fraudulent documents is prohibited and may be
            reported to authorities.
          </Section>
          <Section title="4. Fees">
            Our service fee is shown before you pay and is separate from government
            and third-party charges. Payment terms are displayed at checkout.
          </Section>
          <Section title="5. Your data">
            Your personal data is handled per our{" "}
            <a href="/privacy" className="font-semibold text-iris-600">Privacy Policy</a>.
            You may delete your account and data at any time from your dashboard.
          </Section>
          <Section title="6. Limitation of liability">
            To the maximum extent permitted by law, VisaSetGo is not liable for
            visa refusals, embassy delays, or losses arising from inaccurate
            information provided by you.
          </Section>
          <Section title="7. Contact">
            Questions about these terms? Email{" "}
            <a href="mailto:support@visasetgo.com" className="font-semibold text-iris-600">support@visasetgo.com</a>.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
