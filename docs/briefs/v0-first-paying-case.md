# VisaSetGo — V0: The First Paying Case

**Owner:** Niket · **Status:** Draft for approval · **Date:** 2026-09-08
**Scope of this brief:** what ships between "deployed but earning nothing" and "one real
customer has paid, been filed, and heard back." Nothing beyond that.

---

## 1. The one-line

> Get one real, paying visa case all the way through the pipeline — for three
> destinations only — without a human having to apologise for the software.

This is deliberately not "launch VisaSetGo." The platform is already built and deployed.
The gap is not features; it is the handful of things that make a case *complete*.

---

## 2. Who V0 is for

**The user:** an Indian passport holder, 25–45, salaried or self-employed, booking a
short leisure or business trip to the UAE, Thailand or Singapore in the next 3–6 weeks.
They have booked or are about to book flights. They have never applied for this visa
before, or applied once and found it confusing.

**What they actually want:** not a cheaper visa. Certainty that their file is correct
before they pay a non-refundable government fee.

**Who V0 is explicitly NOT for:** Schengen, UK, US, Canada and Australia applicants.
Those are where the money is (₹2,500–4,500 vs ₹999–1,500), and they are Phase 2. V0 uses
the cheap destinations as the training set for the operating loop, on purpose — the
economics of V0 are not supposed to be good.

> **Stated tension, so nobody rediscovers it later:** the business plan says never compete
> on the simple e-visa tiers, because that is where price is the only variable. V0 launches
> on exactly those tiers. That is intentional — they are the cheapest cases to be wrong
> about while the ops loop is unproven. V0 is a rehearsal, not the business model.

---

## 3. What already exists

Verified against the repo on 2026-09-08. **Stack is Next 14.2.35 / React 18 / Prisma 5 /
Tailwind 3 / NextAuth 4** — note this is an *older* stack than the Next 16 + Prisma 7
projects elsewhere on this machine. Do not write against the newer APIs here.

| Area | State |
|---|---|
| Customer flow — browse, apply, passport OCR, document upload | 18 pages, built |
| Ops console — cases, doc review, status, policy editor, team, audit | 9 pages under `app/(admin)/`, built |
| API surface | 35 route handlers |
| Case pipeline | 14 `ApplicationStatus` stages with full transition history |
| Payments | Razorpay orders + signature-verified webhook, **test keys** |
| Data protection | AES-256 PII, ownership checks, right-to-erasure |
| Email / SMS / WhatsApp | Queued via BullMQ, **worker cannot run on Vercel — nothing delivers** |
| Policy auto-refresh | Same worker, **not running** |
| Automated tests | **None** |

---

## 4. V0 scope — what must be true to take money

### 4.1 Close the four launch items
Straight from `docs/LAUNCH-READINESS.md`, unchanged in priority:

1. **Transactional email actually sends.** Move receipts, document approved/rejected and
   status changes to inline sends from the request path via a provider API. Do not fix this
   by standing up the worker — that adds a host to operate for one feature. Needs a verified
   sender domain on visasetgo.com (SPF/DKIM).
2. **Pooled database connection.** Point `DATABASE_URL` at Neon's `-pooler` host; keep the
   direct URL for migrations only.
3. **Razorpay live.** Live keys, production webhook registered, `RAZORPAY_WEBHOOK_SECRET` set.
4. **Legal sign-off.** Counsel review of Privacy / Terms / Refund; registered entity and
   Grievance Officer named; **decision on Aadhaar — the default is do not store it.**

### 4.2 Three destinations, and only three
`npm run db:seed` creates **8 destination countries but visa policies for only 3**
(UAE, Thailand, Singapore). The other five have destination rows and no policy.

**This must be resolved before launch, and it is the highest-risk item in the brief** —
a destination card that renders and leads nowhere is precisely the "looks finished and
isn't" failure. Either:
- gate the destination list to countries that have an `ACTIVE` policy, or
- render the remaining five as explicitly non-interactive "Opening soon" states.

Not a judgement call: **verify against the production database**, not the seed file. Other
seed scripts (`seed-destinations.ts`, `seed-nz-ca.ts`, `seed-phase2.ts`,
`seed-phase3-schengen.ts`) exist but are **not wired into `db:seed`** and may or may not
have been run.

### 4.3 One honest receipt trail
The customer must receive, by email, without an operator doing anything:
account created · payment received (with amount and what it covers) · each document
approved or rejected with the reason · every case status change · final outcome.

### 4.4 Error visibility
Sentry on client and server before the first real customer. A PII and payments app with no
error monitoring is operating blind.

---

## 5. Explicit non-goals for V0

Listed so they do not creep in:

- Schengen, UK, US, Canada, Australia, New Zealand — Phase 2.
- Travel attach (flights/hotels). Wired but unmonetised; also currently unauthenticated
  and unrated, burning paid RapidAPI quota. **Rate-limit or disable in V0.**
- Rejection cover / insurance attach. Best margin idea in the plan, still Phase 3.
- Policy auto-refresh running automatically. V0 refreshes policies **manually** — three
  destinations is a human-sized job.
- Trade / B2B portal.
- Ops MFA, malware scanning, retention auto-purge. Required before scale, not before case one.
- Next.js 15 upgrade. Critical CVE is already patched on 14.2.35.
- Any new UI. V0 removes and gates; it does not add screens.

---

## 6. Success criteria

V0 is done when **50 real cases** have completed, not when the code merges.

| Metric | Target | Why this one |
|---|---|---|
| Cases completed | 50 | The sample that replaces every modelled number |
| Net revenue realised per case | measured, not modelled | The single variable the business is most sensitive to |
| Cases per operator per month | ≥ 120 run-rate | Below this the software-leverage thesis is wrong |
| Rework rate (docs rejected on first review) | < 25% | Measures whether the generated checklist is actually right |
| Days from payment to filing | ≤ 3 | The promise being sold |
| Support contacts asking "did my payment go through" | **0** | Direct proof the receipt trail works |
| Policy staleness | 0 of 3 stale | Trivial at three destinations; the discipline starts here |

---

## 7. Acceptance criteria

Testable, per the definition of done. Each must be exercised in the running app.

- [ ] `npm run build` passes; `npm run lint` passes.
- [ ] A case can be taken from browse → apply → passport OCR → upload → payment → filed →
      approved, **in production, with live Razorpay**, by someone who is not Niket.
- [ ] Every email in §4.3 arrives in a real inbox (Gmail + one corporate domain), not spam.
- [ ] **Every destination card either opens a working policy or is visibly unavailable.**
      No card leads to an empty or erroring page.
- [ ] Every control on every customer page does something — no stub handlers. 20 TODO /
      placeholder markers currently exist across `app/`, `components/`, `lib/`; audit each
      for user-facing exposure.
- [ ] Loading, empty and error states exist for: destination list, application list,
      document upload, payment. No blank screen on no-data, no unhandled throw on failure.
- [ ] Ownership enforced server-side on every case, document and payment route — verified by
      attempting cross-account access, not by reading the code.
- [ ] Sentry receives a deliberately triggered client error and a server error.
- [ ] Full customer flow checked at 375px.
- [ ] `npm audit` clean of criticals.

---

## 8. Open decisions — needed from Niket

1. **Aadhaar: store or not?** Brief assumes **not**. Confirm.
2. **The five destinations without policies** — gate them, or write the policies before
   launch? Gating is faster and is what this brief assumes.
3. **Refund policy wording.** Against a real refusal rate, this is the most likely source of
   the first dispute. Counsel drafts, but the commercial position is Niket's.
4. **Email provider** — Resend or SES. Resend is faster to verify a domain on; SES is
   cheaper at volume and there is already an EC2 footprint for the WA bot.
5. **Who is the first operator?** The brief assumes Niket runs ops for the first 50 cases,
   which is the only way the cost-per-case number is real.

---

## 9. Build risks

| Risk | Mitigation |
|---|---|
| Inline email is slower than the queue and blocks the request | Send after the response where the flow allows; fire-and-forget with a Sentry breadcrumb on failure |
| Neon pooled connection breaks migrations | Keep `DIRECT_URL` for Prisma migrate; document both in the project CLAUDE.md |
| Razorpay live webhook not reachable / signature mismatch | Test with Razorpay's webhook replay before the first real order |
| Ungated destinations ship anyway | This is the acceptance criterion most likely to be skipped — check it last, in production, on a phone |
| Zero automated tests means every regression is found by a customer | Add integration tests for the three paths that lose money or leak data: payment verify, document IDOR, erasure |
