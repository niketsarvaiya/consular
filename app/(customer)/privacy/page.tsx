import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

const UPDATED = "July 2026";

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-iris-500">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {UPDATED}</p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This is a working template and must be reviewed by legal counsel before
          you rely on it. It is written to align with India&apos;s Digital Personal
          Data Protection Act, 2023 (DPDP Act).
        </div>

        <div className="prose prose-slate mt-8 max-w-none space-y-8 text-sm leading-relaxed text-slate-600">
          <Section title="1. Who we are">
            VisaSetGo (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a visa-assistance platform for Indian
            passport holders. We act as a Data Fiduciary under the DPDP Act for the
            personal data you share with us.
          </Section>

          <Section title="2. What we collect">
            <ul className="list-disc pl-5">
              <li><strong>Account data:</strong> name, email, phone number.</li>
              <li><strong>Identity & travel documents:</strong> passport details and images, photographs, financial statements, and other documents you upload for your visa application.</li>
              <li><strong>Application data:</strong> destinations, visa type, and status.</li>
              <li><strong>Technical data:</strong> IP address and basic logs, used for security.</li>
            </ul>
          </Section>

          <Section title="3. Why we use it (purpose)">
            Solely to prepare, review, and submit your visa application and to
            communicate with you about it. We do not sell your data or use it for
            advertising. We process it based on the consent you give when you sign
            up and upload documents.
          </Section>

          <Section title="4. How we protect it">
            <ul className="list-disc pl-5">
              <li>All traffic is encrypted in transit (HTTPS/TLS).</li>
              <li>Documents are stored in a private cloud bucket, never publicly accessible, and served only through short-lived, expiring links.</li>
              <li>Passport numbers are encrypted at rest (AES-256).</li>
              <li>Access is restricted to authorised team members for the purpose of reviewing your application.</li>
            </ul>
          </Section>

          <Section title="5. Aadhaar and sensitive IDs">
            Please share an Aadhaar or other government ID only if it is actually
            required for your application. Where possible, mask numbers you don&apos;t
            need to disclose. We handle such documents strictly for the stated
            purpose and delete them per the retention policy below.
          </Section>

          <Section title="6. Sharing">
            We share data only with the relevant embassy/consulate or authorised
            visa application centre to process your application, and with
            infrastructure providers (hosting, storage, payments) bound by
            confidentiality. We never sell your data.
          </Section>

          <Section title="7. Retention">
            We keep your documents only as long as needed to process your
            application and to meet legal obligations, after which they are
            deleted. You can delete your account and all associated data at any
            time from your dashboard (&ldquo;Delete account &amp; data&rdquo;).
          </Section>

          <Section title="8. Your rights">
            You have the right to access, correct, and erase your personal data,
            and to withdraw consent. Use the dashboard, or contact us below. We
            will respond within the timelines required by law.
          </Section>

          <Section title="9. Grievance / Data Protection contact">
            For any privacy request or complaint, contact our Grievance Officer at{" "}
            <a href="mailto:privacy@visasetgo.com" className="font-semibold text-iris-600">privacy@visasetgo.com</a>.
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
