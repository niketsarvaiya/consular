# VisaSetGo — Security, Data Retention & Breach Response

_Internal operational document. Review with legal counsel before launch._

## 1. Data classification

| Data | Sensitivity | Where stored | Protection |
|------|-------------|--------------|------------|
| Passport number | High | Postgres (Neon) | AES-256-GCM app-layer encryption |
| Passport / Aadhaar / photo / bank docs | High | Cloudflare R2 (private) | Private bucket, 15-min signed URLs, encrypted at rest |
| Name, email, phone | Medium | Postgres | Access-controlled |
| Passwords | High | Postgres | bcrypt (cost 12) |

## 2. Access control
- Customers can only access their own applications/documents (ownership checks on every route; verified against IDOR).
- Ops/admin access is role-gated (`requireOpsRole`) and audit-logged.
- Storage is never public; files are served only via short-lived signed URLs.

## 3. Retention policy
- **Active applications:** documents retained while the application is in progress.
- **Completed/closed:** purge uploaded documents within **90 days** of closure unless the customer requests earlier deletion or law requires longer.
- **Account deletion:** on user request (dashboard → Delete account & data) or via `DELETE /api/account`, all DB rows and R2 files are permanently erased immediately.
- **Audit logs:** retained 12 months for security, then rotated.

> TODO: implement a scheduled job to auto-purge documents 90 days after case closure (currently manual + on-request only).

## 4. Right to erasure (DPDP)
- Self-service: dashboard "Delete account & data".
- Endpoint: `DELETE /api/account` → `deleteCustomerData()` removes R2 files then all DB records in FK-safe order.

## 5. Breach response plan
1. **Detect & contain** — revoke exposed credentials, rotate `ENCRYPTION_KEY` / R2 keys / DB creds, isolate the affected system.
2. **Assess** — scope which data/customers were affected using audit logs.
3. **Notify** — inform the Data Protection Board of India and affected users as required by the DPDP Act, without undue delay.
4. **Remediate & record** — patch root cause, document the incident and actions taken.
- Security contact: **privacy@visasetgo.com**

## 6. Secrets & key management
- All secrets live in Vercel env vars / `.env.local` (gitignored) — never committed.
- Rotate `ENCRYPTION_KEY`, R2 keys, DB URL, and `NEXTAUTH_SECRET` on any suspected compromise and on a periodic schedule.
- Note: rotating `ENCRYPTION_KEY` requires re-encrypting existing passport numbers — plan a migration before rotation.

## 7. Hardening in place
- HTTPS everywhere + HSTS; anti-clickjacking / no-sniff / referrer headers.
- Rate limiting on login, registration, and uploads (Redis-backed).
- Uploads validated by magic bytes (not client MIME); 5 MB cap; PDF/JPEG/PNG only.
- Dependencies patched (Next.js auth-bypass CVE, axios advisories).

## 8. Open items before handling real Aadhaar at scale
- [ ] Legal review of Aadhaar handling (Aadhaar Act) + this policy.
- [ ] Published, counsel-approved Privacy Policy & Terms.
- [ ] Scheduled retention purge job.
- [ ] Malware/AV scanning on uploads.
- [ ] Independent penetration test.
- [ ] Next.js 15 upgrade (clears remaining lower-severity advisories).
- [ ] Consider MFA for ops/admin accounts.
