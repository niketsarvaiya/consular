import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

const UPDATED = "July 2026";

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-iris-500">Legal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {UPDATED}</p>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This is a working template intended to be reviewed and finalised by
          qualified legal counsel before you rely on it. It is drafted for a visa
          facilitation service operating in India.
        </div>

        <div className="mt-8 max-w-none space-y-8 text-sm leading-relaxed text-slate-600">
          <Section n="1" title="Agreement to these terms">
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) form a legally binding agreement
            between you (&ldquo;you&rdquo;, &ldquo;the customer&rdquo;) and VisaSetGo (&ldquo;VisaSetGo&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) governing your access to and use of the
            VisaSetGo website, platform, and services (together, the &ldquo;Services&rdquo;).
            By creating an account, uploading documents, or using the Services in
            any way, you confirm that you have read, understood, and agree to be
            bound by these Terms and our{" "}
            <a href="/privacy" className="font-semibold text-iris-600">Privacy Policy</a>.
            If you do not agree, do not use the Services.
          </Section>

          <Section n="2" title="Who can use the Services">
            <ul className="list-disc space-y-1 pl-5">
              <li>You must be at least 18 years of age and legally capable of entering into a contract under the Indian Contract Act, 1872.</li>
              <li>If you use the Services on behalf of another person (e.g. a family member), you confirm you are authorised to do so and to share their information and documents.</li>
              <li>The Services are intended for Indian passport holders seeking assistance with visa applications.</li>
            </ul>
          </Section>

          <Section n="3" title="What we do — nature of the service">
            VisaSetGo is an independent, private <strong>visa facilitation and
            documentation-assistance service</strong>. We help you understand
            requirements, prepare and review documents, and (where offered) submit
            your application to the relevant embassy, consulate, or authorised visa
            application centre.
            <p className="mt-2">
              We are <strong>not</strong> a government agency, embassy, or consulate,
              and we are not affiliated with, endorsed by, or acting on behalf of any
              government authority. We do not issue visas.
            </p>
          </Section>

          <Section n="4" title="No guarantee of visa approval">
            <ul className="list-disc space-y-1 pl-5">
              <li>The grant, refusal, delay, or cancellation of any visa is at the <strong>sole and absolute discretion of the relevant embassy or government authority</strong>. We have no control or influence over the outcome, processing time, or decisions of any authority.</li>
              <li>Nothing on the Services — including approval-rate figures, timelines, or checklists — constitutes a promise, warranty, or guarantee of a particular outcome.</li>
              <li>Our service fee is charged for the assistance we provide, <strong>not</strong> for a successful visa, and remains payable regardless of the decision on your application.</li>
            </ul>
          </Section>

          <Section n="5" title="Your responsibilities & accurate information">
            <ul className="list-disc space-y-1 pl-5">
              <li>You are solely responsible for the <strong>accuracy, completeness, authenticity, and legality</strong> of all information and documents you provide.</li>
              <li>You must not submit <strong>forged, tampered, misrepresented, or fraudulent</strong> documents or information. Doing so is illegal, may lead to visa refusal or bans by authorities, and may be reported to the relevant authorities.</li>
              <li>You must respond promptly to requests for information and keep your account details current.</li>
              <li>You are responsible for meeting the eligibility criteria of the destination country; we can advise but cannot change those requirements.</li>
            </ul>
          </Section>

          <Section n="6" title="Fees, payments & taxes">
            <ul className="list-disc space-y-1 pl-5">
              <li>Our <strong>service fee</strong> is displayed before you pay and is separate from <strong>government/embassy fees</strong> and any third-party charges (e.g. VFS, courier, biometrics), which are set by those parties.</li>
              <li>Applicable <strong>GST</strong> and payment-gateway charges are shown at checkout where relevant.</li>
              <li>Payments are processed by third-party payment providers (e.g. Razorpay); your use of them is subject to their terms.</li>
              <li>Prices may change over time; the price shown at the time of your payment applies to that transaction.</li>
            </ul>
          </Section>

          <Section n="7" title="Refunds & cancellations">
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Government and third-party fees are non-refundable</strong> once paid to those authorities, regardless of the visa outcome.</li>
              <li>Our <strong>service fee</strong> is refundable only to the extent work has not yet been performed, as described at checkout or in a specific plan. Once document review or submission has begun, the service fee (or a portion of it) may be non-refundable.</li>
              <li>To request a refund or cancel, contact <a href="mailto:support@visasetgo.com" className="font-semibold text-iris-600">support@visasetgo.com</a>. Approved refunds are processed to the original payment method.</li>
            </ul>
          </Section>

          <Section n="8" title="Processing times">
            Any timelines shown are <strong>estimates</strong> based on typical embassy
            processing and are not guaranteed. Actual times depend on the authority,
            season, completeness of documents, and factors outside our control.
          </Section>

          <Section n="9" title="Your data & privacy">
            We collect and process your personal data — including sensitive identity
            and travel documents — strictly to provide the Services, as described in
            our <a href="/privacy" className="font-semibold text-iris-600">Privacy Policy</a>,
            which forms part of these Terms. You may access, correct, or permanently
            delete your data at any time from your dashboard.
          </Section>

          <Section n="10" title="Acceptable use">
            You agree not to: (a) use the Services for any unlawful purpose;
            (b) upload malware or attempt to gain unauthorised access to our systems
            or other users&apos; data; (c) copy, scrape, resell, or reverse-engineer the
            Services; (d) impersonate any person or misrepresent your identity; or
            (e) interfere with the security or operation of the platform. We may
            suspend or terminate accounts that violate these Terms.
          </Section>

          <Section n="11" title="Intellectual property">
            All content, branding, software, and design of the Services are owned by
            or licensed to VisaSetGo and are protected by law. We grant you a
            limited, non-exclusive, non-transferable licence to use the Services for
            your personal visa needs. You retain ownership of the documents you upload.
          </Section>

          <Section n="12" title="Third-party services & links">
            The Services rely on and may link to third parties (embassies, VFS,
            payment providers, hosting/storage). We are not responsible for the
            content, availability, or practices of third parties, and your dealings
            with them are governed by their own terms.
          </Section>

          <Section n="13" title="Disclaimers">
            The Services are provided on an <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong>
            basis. To the maximum extent permitted by law, we disclaim all warranties,
            express or implied, including fitness for a particular purpose and any
            warranty regarding visa outcomes, accuracy of third-party requirements,
            or uninterrupted availability.
          </Section>

          <Section n="14" title="Limitation of liability">
            To the maximum extent permitted by law, VisaSetGo (and its founders,
            employees, and partners) shall not be liable for any indirect, incidental,
            special, or consequential losses, or for visa refusals, embassy delays,
            missed travel, or losses arising from inaccurate or incomplete
            information you provided. Our <strong>total aggregate liability</strong> for
            any claim relating to the Services shall not exceed the <strong>service
            fee you paid to us</strong> for the specific application giving rise to the claim.
          </Section>

          <Section n="15" title="Indemnity">
            You agree to indemnify and hold VisaSetGo harmless from any claims,
            losses, or expenses arising out of your breach of these Terms, your
            misuse of the Services, or any false, forged, or unlawful information or
            documents you provide.
          </Section>

          <Section n="16" title="Suspension & termination">
            You may stop using the Services and delete your account at any time. We
            may suspend or terminate your access if you breach these Terms, misuse
            the Services, or where required by law. Provisions that by their nature
            should survive termination (fees owed, disclaimers, limitation of
            liability, indemnity) will survive.
          </Section>

          <Section n="17" title="Changes to these Terms">
            We may update these Terms from time to time. Material changes will be
            notified via the platform or email. Continued use after changes take
            effect constitutes acceptance of the updated Terms.
          </Section>

          <Section n="18" title="Governing law & dispute resolution">
            These Terms are governed by the laws of India. Subject to any mandatory
            consumer-protection rights you may have, the courts at
            <strong> Mumbai, Maharashtra</strong> shall have exclusive jurisdiction.
            The parties will first attempt to resolve any dispute amicably before
            pursuing legal remedies.
          </Section>

          <Section n="19" title="Contact & grievance redressal">
            For questions, complaints, or grievances regarding the Services:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>General support: <a href="mailto:support@visasetgo.com" className="font-semibold text-iris-600">support@visasetgo.com</a></li>
              <li>Privacy / data grievances: <a href="mailto:privacy@visasetgo.com" className="font-semibold text-iris-600">privacy@visasetgo.com</a></li>
            </ul>
            <p className="mt-2 text-xs text-slate-400">
              [Add registered business name, address, and Grievance Officer details
              here before publishing.]
            </p>
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
