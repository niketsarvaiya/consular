# VisaSetGo — Production Launch Readiness Review

_Reviewed for a go-live within ~15 days. Severity: 🔴 blocker · 🟠 important · 🟡 polish._

---

## 🔴 Blockers — do NOT onboard real users until these are done

### 1. Emails/notifications don't send in production
`enqueueNotification()` only pushes jobs onto a **BullMQ queue**; the actual sending
happens in a **separate worker** (`workers/index.ts`, `npm run worker`). That worker
**does not run on Vercel** (serverless). Result: welcome emails, payment receipts,
document approved/rejected notices — **none are delivered**.
- **Fix (fastest):** send transactional emails **inline** from the request path using a
  provider API (Resend or AWS SES) instead of the queue, OR run the worker on a small
  always-on host (Render/Railway/EC2 — you already run the WA bot on EC2).
- Requires an email provider + verified sender domain (SPF/DKIM on visasetgo.com).

### 2. Database connection pooling for serverless
`DATABASE_URL` points at the **direct** Neon host (no `-pooler`). Vercel functions open
many short-lived connections and will **exhaust Postgres connections** under load.
- **Fix:** use Neon's **pooled** connection string (the `-pooler` host) for `DATABASE_URL`,
  or add Prisma Accelerate. Keep the direct URL only for migrations.

### 3. Razorpay: go live properly
Currently **test keys**. Before real payments:
- Swap to **live keys** (`rzp_live_…`) once the account is activated.
- Create the **webhook** (payment.captured, order.paid) and set `RAZORPAY_WEBHOOK_SECRET`.

### 4. Legal / compliance (needs counsel, not code)
- **Aadhaar** handling review (Aadhaar Act) — decide whether to store it at all.
- **DPDP Act:** registered entity name + **Grievance Officer** details in Privacy/Terms
  (placeholders present), counsel review of Privacy/Terms/Refund.

---

## 🟠 Important — fit inside the 15 days

| # | Area | Issue | Fix |
|---|------|-------|-----|
| 5 | Observability | No error monitoring | Add **Sentry** (client+server) — you're blind to prod errors on a PII/payment app |
| 6 | Backend | `/api/travel/flights` & `/hotels` are unauthenticated + unrated | Rate-limit (+ ideally auth) — they burn your paid RapidAPI quota if scraped |
| 7 | Testing | **0 automated tests** | Add integration tests for payment-verify, document IDOR, and erasure; plus a manual smoke checklist |
| 8 | Uploads | No malware/AV scan | Scan uploads (ops staff open these files) — e.g. ClamAV or an AV API |
| 9 | Retention | Auto-purge not implemented | Scheduled job to delete docs 90 days after case closure (currently on-request only) |
| 10 | Security | No MFA for ops/admin | Admin sees all customer PII behind just a password — add 2FA |
| 11 | Deps | Remaining Next.js advisories (lower severity) | Tested **Next.js 15** upgrade (critical CVE already patched on 14.2.35) |
| 12 | Backups | Confirm Neon PITR + R2 durability | Verify backup/retention on the Neon plan; consider R2 object versioning |
| 13 | OCR | OCR.space free tier accuracy | Validate on real passports; Google Vision is a drop-in upgrade if weak |

---

## 🟡 Polish

- **SEO:** no `robots.txt` / `sitemap` — add for the marketing pages.
- **73 TODO/placeholder markers** — audit for any user-facing stubs.
- **Hero thumbnails** show non-live countries (decorative, non-linking) — optionally source from live only.
- **Accessibility pass** (WCAG AA): labels, focus states, alt text, contrast on gradient text.
- **Analytics** (PostHog/GA) for the signup→application→payment funnel.
- **Mobile QA** at 375px across every flow.
- Rate limiting is **fail-open** (availability over strictness — documented in SECURITY.md).

---

## By angle — quick verdict

- **UI:** Strong. Consistent "Modern Wanderlust" system, animated, broken images fixed.
- **UX:** Good flows; **the missing email confirmations are the biggest UX/trust gap** (no receipts).
- **Security:** Solid after this session — IDOR closed, ownership checks, security headers, rate limiting, AES-256 PII, signature-verified webhook, patched critical CVEs. Remaining: MFA, AV scan, monitoring.
- **Functionality:** Core works end-to-end; **email delivery broken in prod** (#1); payments verified in test.
- **Database:** Schema clean, PII encrypted, right-to-erasure implemented; needs pooled connection (#2) + backup confirmation.
- **Backend:** Clean service layer; **worker-dependent features (email, policy auto-refresh) don't run on Vercel** (#1).
- **Vulnerabilities:** Critical patched; run `npm audit` before each release; **independent pentest recommended** before scale.

---

## Suggested 15-day sequence
1. **Days 1–3:** Email inline/worker (#1) + Neon pooling (#2) + Sentry (#5).
2. **Days 4–6:** Razorpay live + webhook (#3); rate-limit travel routes (#6); ops MFA (#10).
3. **Days 7–9:** Retention purge (#9) + AV scanning (#8); smoke tests + a few integration tests (#7).
4. **Days 10–12:** Legal review + grievance details (#4); accessibility + mobile QA; SEO.
5. **Days 13–15:** Full regression pass, `/code-review ultra`, external pentest booking, staging dry-run with real flows.
