import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

const UPDATED = "July 2026";

export default function RefundPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-iris-500">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Refund &amp; Cancellation Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {UPDATED}</p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This is a working template and should be reviewed by legal counsel and
          aligned with your final pricing before you rely on it.
        </div>

        <div className="mt-8 max-w-none space-y-8 text-sm leading-relaxed text-slate-600">
          <Section n="1" title="How our charges are structured">
            When you pay for a visa application through VisaSetGo, your total may
            include up to three separate components:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Government / embassy fee</strong> — set and collected by the authority.</li>
              <li><strong>Third-party charges</strong> — e.g. VFS, biometrics, courier (where applicable).</li>
              <li><strong>VisaSetGo service fee</strong> — our charge for document preparation, review, and submission assistance.</li>
            </ul>
            Different components follow different refund rules, explained below.
          </Section>

          <Section n="2" title="Government & third-party fees">
            Once paid to an embassy, consulate, VFS, or other authority, these fees
            are <strong>non-refundable</strong> — regardless of whether your visa is
            approved, refused, or delayed. This is the policy of those authorities
            and is outside our control.
          </Section>

          <Section n="3" title="Our service fee">
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Before we begin work:</strong> if you cancel before our team has started reviewing your documents or begun submission, your service fee is <strong>fully refundable</strong>.</li>
              <li><strong>After work has begun:</strong> once document review or submission has started, the service fee (or a fair portion reflecting the work completed) may be <strong>non-refundable</strong>.</li>
              <li><strong>Visa refusal:</strong> because our fee is for the assistance provided and not for a guaranteed outcome, the service fee is <strong>not automatically refunded</strong> if a visa is refused. We will, however, guide you on reapplying where possible.</li>
            </ul>
          </Section>

          <Section n="4" title="When we may issue a refund">
            We will refund your service fee where:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>you cancelled before any work began; or</li>
              <li>we were unable to provide the service you paid for due to an error on our side; or</li>
              <li>you were charged incorrectly (e.g. a duplicate payment).</li>
            </ul>
          </Section>

          <Section n="5" title="How to request a refund or cancel">
            Email <a href="mailto:support@visasetgo.com" className="font-semibold text-iris-600">support@visasetgo.com</a>{" "}
            from your registered email with your application reference. Please
            include the reason for your request.
          </Section>

          <Section n="6" title="Processing time & method">
            Approved refunds are processed to your <strong>original payment method</strong>{" "}
            within <strong>7–10 business days</strong> of approval. Payment-gateway or
            bank timelines may add a few days. Any gateway charges on the original
            transaction may be deducted where applicable.
          </Section>

          <Section n="7" title="Questions">
            For anything about this policy, contact{" "}
            <a href="mailto:support@visasetgo.com" className="font-semibold text-iris-600">support@visasetgo.com</a>.
            This policy should be read together with our{" "}
            <a href="/terms" className="font-semibold text-iris-600">Terms &amp; Conditions</a>.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink">
        <span className="text-iris-500">{n}.</span> {title}
      </h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
